"use client"
import { useCallback, useEffect, useRef, useState } from "react"
import useSWR from "swr"
import { useVirtualizer } from "@tanstack/react-virtual"
import { useSearchParams } from "next/navigation"

import { VideoWithStats, VideoComment } from "#/videos"
import useVideo from "@/hooks/videos/use-video"
import useVideoMutation from "@/hooks/videos/use-video-mutations"
import { useUserMutation } from "@/hooks/user/use-user-mutation"
import { useUser } from "@/hooks/user/use-user"
import useOptimisticVideo from "@/hooks/videos/use-optimistic-video"
import { useIsMobile } from "@/hooks/use-mobile"
import { useAuth } from "@/providers/Auth"
import { DEFAULT_THUMBNAIL } from "@/constants"
import DebugWindow from "@/components/custom/DebugWindow"
import MobileInteractions from "@/components/custom/app/video/MobileInteractions"
import { getWatchedVideos } from "@/services/client/user"
import ClientOnly from "@/components/custom/ClientOnly"

import VideoPlayer from "./VideoPlayer"
import DesktopPlayerInteractions from "./DesktopPlayerInteractions"

const FETCH_TRIGGER_OFFSET = 10

export default function PlayerCanvas({ videos }: { videos: VideoWithStats[] }) {
    const [allVideos, setAllVideos] = useState(videos)
    const [activeId, setActiveId] = useState<string | null>(videos[0]?.id ?? null)
    const [isFetchingNext, setIsFetchingNext] = useState(false)
    const [lastFetchedVideoId, setLastFetchedVideoId] = useState<string | null>(null)
    const [commentTexts, setCommentTexts] = useState<Map<string, string>>(new Map())
    const isMobile = useIsMobile()

    const { user, isAuthenticated, profile } = useAuth()
    const { getProfile, getFollowing } = useUser()

    const searchParams = useSearchParams()
    const userId = searchParams.get("u") || undefined

    const parentRef = useRef<HTMLDivElement | null>(null)
    const { loading, getClientPaginatedVideos } = useVideo(userId)

    const activeIndex = allVideos.findIndex((v) => v.id === activeId)
    const activeVideo = activeIndex >= 0 ? allVideos[activeIndex] : allVideos[0]

    const {
        loading: mutationLoading,
        error: mutationError,
        toggleLike,
        toggleBookmark,
        addComment,
        shareVideo,
        downloadVideo,
        addView,
    } = useVideoMutation()
    const {
        loading: userMutationLoading,
        error: userMutationError,
        toggleFollow,
    } = useUserMutation()

    const swrConfig = {
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
        dedupingInterval: 60000,
        errorRetryCount: 2,
    }

    const { data: userExtra, isLoading: followingsLoading } = useSWR(
        ["user-extra", profile?.uid],
        async () => {
            return await Promise.all([getFollowing(profile!.uid), getWatchedVideos(profile!.uid)])
        },
        swrConfig,
    )

    const { data: ownerProfile, isLoading: profileLoading } = useSWR(
        [`user-profile`, activeVideo.userId],
        ([, userId]) => getProfile(userId),
        swrConfig,
    )

    const {
        updateOptimisticView,
        updateOptimisticLike,
        updateOptimisticBookmark,
        updateOptimisticShare,
        updateOptimisticDownload,
        updateOptimisticFollow,
        updateOptimisticComment,
        removeOptimisticComment,
        getCurrentStats,
    } = useOptimisticVideo(activeVideo, profile?.uid, userExtra?.[0], userExtra?.[1])

    const stableHandleViewUpdate = useCallback(
        (videoId: string) => {
            updateOptimisticView(videoId)
        },
        [updateOptimisticView],
    )

    const estimateSize = () => parentRef.current?.clientHeight ?? 850

    const rowVirtualizer = useVirtualizer({
        count: allVideos.length,
        getScrollElement: () => parentRef.current,
        estimateSize: estimateSize,
        overscan: 3,
    })

    const fetchNextVideos = useCallback(async () => {
        if (isFetchingNext || loading) return
        const lastVideo = allVideos[allVideos.length - 1]
        if (!lastVideo || lastFetchedVideoId === lastVideo.id) return

        setIsFetchingNext(true)
        setLastFetchedVideoId(lastVideo.id)

        const newVideos = await getClientPaginatedVideos(lastVideo.id)
        if (newVideos?.length) {
            const existingIds = new Set(allVideos.map((v) => v.id))
            const uniqueNewVideos = newVideos.filter((v) => !existingIds.has(v.id))
            setAllVideos((prev) => [...prev, ...uniqueNewVideos])
        }

        setIsFetchingNext(false)
    }, [allVideos, lastFetchedVideoId, isFetchingNext, loading, getClientPaginatedVideos])

    useEffect(() => {
        if (loading || isFetchingNext) return
        const triggerIndex = allVideos.length - FETCH_TRIGGER_OFFSET
        if (activeIndex >= triggerIndex) {
            fetchNextVideos()
        }
    }, [activeIndex, allVideos.length, loading, isFetchingNext, fetchNextVideos])

    const virtualItems = rowVirtualizer.getVirtualItems()
    useEffect(() => {
        const rootEl = parentRef.current
        if (!rootEl) return

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const id = entry.target.getAttribute("data-id")
                        if (id && id !== activeId) {
                            setActiveId(id)
                            stableHandleViewUpdate(id)
                            addView(id, user?.uid)
                        }
                    }
                })
            },
            { threshold: 0.6, root: rootEl },
        )

        const videoElements = rootEl.querySelectorAll("[data-id]")
        videoElements.forEach((el) => observer.observe(el))

        return () => observer.disconnect()
    }, [virtualItems, activeId, user?.uid, stableHandleViewUpdate, addView])

    const handleFollowToggle = async (videoId: string) => {
        if (!isAuthenticated) return

        const currentStats = getCurrentStats()
        updateOptimisticFollow(videoId)

        await toggleFollow(activeVideo.userId, currentStats.isFollowing)
    }

    const handleLikeToggle = async (videoId: string) => {
        if (!isAuthenticated) return

        const currentStats = getCurrentStats()
        updateOptimisticLike(videoId)

        await toggleLike(videoId, currentStats.userLiked)
    }

    const handleBookmark = async (videoId: string) => {
        if (!isAuthenticated) return

        const currentStats = getCurrentStats()
        updateOptimisticBookmark(videoId)

        await toggleBookmark(videoId, currentStats.userBookmarked)
    }

    const handleShare = async (videoId: string) => {
        if (!isAuthenticated) return

        updateOptimisticShare(videoId)
        await shareVideo(videoId)
    }

    const handleDownload = async (videoId: string) => {
        updateOptimisticDownload(videoId)

        const link = document.createElement("a")
        link.href = `/api/proxy/${videoId}`
        link.download = ""
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        await downloadVideo(videoId)
    }

    const handleComment = async (videoId: string, e: React.FormEvent) => {
        e.preventDefault()
        if (!isAuthenticated) return

        const text = commentTexts.get(videoId)?.trim()
        if (!text) return

        // Clear comment text for this video
        setCommentTexts((prev) => {
            const newMap = new Map(prev)
            newMap.set(videoId, "")
            return newMap
        })

        const tempComment = {
            id: `temp-${Date.now()}`,
            msg: text,
            username: profile?.userName,
            profile_picture: profile?.profile_picture,
            isReply: false,
            likes: 0,
            replies: 0,
        } as unknown as VideoComment

        updateOptimisticComment(videoId, tempComment)

        const res = await addComment(videoId, text)

        if (!res?.commentId) {
            console.error("Failed to add comment:", mutationError)
            removeOptimisticComment(videoId, tempComment.id)
            // Restore text on error
            setCommentTexts((prev) => {
                const newMap = new Map(prev)
                newMap.set(videoId, text)
                return newMap
            })
        }
    }

    const handleCommentTextChange = (videoId: string, text: string) => {
        setCommentTexts((prev) => {
            const newMap = new Map(prev)
            newMap.set(videoId, text)
            return newMap
        })
    }

    const isLoading = userMutationLoading || followingsLoading || mutationLoading
    const currentStats = getCurrentStats()

    return (
        <>
            <DebugWindow>
                <div>
                    Active: {activeIndex + 1}/{allVideos.length}
                </div>
                <div>ID: {activeVideo?.id?.slice(-6)}</div>
                <div>Loading: {loading ? "Yes" : "No"}</div>
                <div>Fetching: {isFetchingNext ? "Yes" : "No"}</div>
            </DebugWindow>
            <section className="h-[calc(100vh-6rem)] flex justify-center w-full">
                <div className="w-full md:w-4/6 h-full flex flex-row items-center justify-center md:p-2 md:gap-2">
                    <div
                        ref={parentRef}
                        data-root-scroll
                        className="flex-1 aspect-9/16 h-full overflow-y-auto snap-y snap-mandatory no-scrollbar"
                    >
                        <div
                            style={{
                                height: `${rowVirtualizer.getTotalSize()}px`,
                                width: "100%",
                                position: "relative",
                            }}
                        >
                            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                                const video = allVideos[virtualRow.index]
                                return (
                                    <div
                                        key={video.id}
                                        data-id={video.id}
                                        data-idx={virtualRow.index}
                                        className="absolute top-0 left-0 w-full snap-start"
                                        style={{
                                            transform: `translateY(${virtualRow.start}px)`,
                                            height: `${virtualRow.size}px`,
                                        }}
                                    >
                                        <VideoPlayer
                                            videoSrc={video.videoUrl}
                                            videoId={video.id}
                                            activeVideoId={activeVideo?.id}
                                            thumbnail={video.thumbnail}
                                            index={virtualRow.index}
                                            activeIndex={activeIndex}
                                        />
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {isMobile ? (
                        <MobileInteractions
                            handleComment={(e: React.FormEvent) => handleComment(activeVideo.id, e)}
                            handleDownload={() => handleDownload(activeVideo.id)}
                            handleShare={() => handleShare(activeVideo.id)}
                            handleBookmark={() => handleBookmark(activeVideo.id)}
                            handleLikeToggle={() => handleLikeToggle(activeVideo.id)}
                            handleFollowToggle={() => handleFollowToggle(activeVideo.id)}
                            isLoading={isLoading}
                            error={mutationError || userMutationError}
                            currentStats={currentStats}
                            userFollowed={currentStats.isFollowing}
                            userAuthed={isAuthenticated}
                            ownerProfilePicture={ownerProfile?.profile_picture || DEFAULT_THUMBNAIL}
                            video={activeVideo}
                            commentMutation={{
                                text: commentTexts.get(activeVideo.id) ?? "",
                                setText: (text: string) =>
                                    handleCommentTextChange(activeVideo.id, text),
                                disabled: isLoading || profileLoading,
                            }}
                        />
                    ) : (
                        <ClientOnly>
                            <DesktopPlayerInteractions
                                handleComment={(e: React.FormEvent) =>
                                    handleComment(activeVideo.id, e)
                                }
                                handleDownload={() => handleDownload(activeVideo.id)}
                                handleShare={() => handleShare(activeVideo.id)}
                                handleBookmark={() => handleBookmark(activeVideo.id)}
                                handleLikeToggle={() => handleLikeToggle(activeVideo.id)}
                                handleFollowToggle={() => handleFollowToggle(activeVideo.id)}
                                isLoading={isLoading}
                                error={mutationError || userMutationError}
                                currentStats={currentStats}
                                userFollowed={currentStats.isFollowing}
                                userAuthed={isAuthenticated}
                                ownerProfilePicture={
                                    ownerProfile?.profile_picture || DEFAULT_THUMBNAIL
                                }
                                video={activeVideo}
                                commentMutation={{
                                    text: commentTexts.get(activeVideo.id) ?? "",
                                    setText: (text: string) =>
                                        handleCommentTextChange(activeVideo.id, text),
                                    disabled: isLoading || profileLoading,
                                }}
                            />
                        </ClientOnly>
                    )}
                </div>
            </section>
        </>
    )
}
