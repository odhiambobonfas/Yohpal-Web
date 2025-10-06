"use client"
import { useVirtualizer } from "@tanstack/react-virtual"
import { useSearchParams } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"
import useSWR from "swr"

import { VideoComment, VideoWithStats } from "#/videos"
import ClientOnly from "@/components/custom/ClientOnly"
import DebugWindow from "@/components/custom/DebugWindow"
import MobileInteractions from "@/components/custom/app/video/MobileInteractions"
import { useIsMobile } from "@/hooks/use-mobile"
import { useUser } from "@/hooks/user/use-user"
import { useUserMutation } from "@/hooks/user/use-user-mutation"
import useOptimisticVideo from "@/hooks/videos/use-optimistic-video"
import useVideo from "@/hooks/videos/use-video"
import useVideoMutation from "@/hooks/videos/use-video-mutations"
import { useAuth } from "@/providers/Auth"
import { getWatchedVideos } from "@/services/client/user"

import { Button } from "@/components/ui/button"
import { LucideChevronDown, LucideChevronUp } from "lucide-react"
import DesktopPlayerInteractions from "./DesktopPlayerInteractions"
import InteractionsLoginPrompt from "./InteractionsLoginPrompt"
import VideoPlayer from "./VideoPlayer"

const FETCH_TRIGGER_OFFSET = 10

const swrConfig = {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 60000,
    errorRetryCount: 2,
}

// TODO(c33d72afe614) :: Factor out all handlers
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

    function moveNext() {
        const currentIndex = allVideos.findIndex((v) => v.id === activeId)
        const nextId = currentIndex + 1
        if (nextId > allVideos.length - 1) return
        setActiveId(allVideos[nextId].id)
        rowVirtualizer.scrollToIndex(nextId)
    }

    function movePrev() {
        const currentIndex = allVideos.findIndex((v) => v.id === activeId)
        const nextId = currentIndex - 1
        if (nextId < 0) return
        setActiveId(allVideos[nextId].id)
        rowVirtualizer.scrollToIndex(nextId)
    }
    const {
        loading: mutationLoading,
        error: mutationError,
        toggleLike,
        toggleBookmark,
        addComment,
        shareVideo,
        downloadVideo,
        addView,
        deleteComment,
        toggleCommentLike,
    } = useVideoMutation()
    const {
        loading: userMutationLoading,
        error: userMutationError,
        toggleFollow,
    } = useUserMutation()

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
        updateOptimisticCommentLike,
        resetOptimisticStore,
        getCurrentStats,
    } = useOptimisticVideo(activeVideo, profile?.uid, userExtra?.[0], userExtra?.[1])

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

        const newVideos = await getClientPaginatedVideos(lastVideo.id, profile?.uid)
        if (newVideos?.length) {
            const existingIds = new Set(allVideos.map((v) => v.id))
            const uniqueNewVideos = newVideos.filter((v) => !existingIds.has(v.id))
            setAllVideos((prev) => [...prev, ...uniqueNewVideos])
            resetOptimisticStore()
        }

        setIsFetchingNext(false)
    }, [
        allVideos,
        lastFetchedVideoId,
        profile?.uid,
        isFetchingNext,
        loading,
        resetOptimisticStore,
        getClientPaginatedVideos,
    ])

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
                            updateOptimisticView(id)
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
    }, [virtualItems, activeId, user?.uid, updateOptimisticView, addView])

    const [autoScrollEnabled, setAutoScrollEnabled] = useState(true)

    useEffect(() => {
        const saved = localStorage.getItem("autoscrollEnabled")
        if (saved !== null) {
            setAutoScrollEnabled(saved === "true")
        }
    }, [])

    useEffect(() => {
        localStorage.setItem("autoscrollEnabled", String(autoScrollEnabled))
    }, [autoScrollEnabled])

    // Handlers
    const handleFollowToggle = async (videoId: string) => {
        if (!isAuthenticated) {
            openAuthDialog()
            return
        }

        const currentStats = getCurrentStats()
        updateOptimisticFollow(videoId)

        await toggleFollow(activeVideo.userId, currentStats.isFollowing)
    }

    const handleLikeToggle = async (videoId: string) => {
        if (!isAuthenticated) {
            openAuthDialog()
            return
        }

        const currentStats = getCurrentStats()
        updateOptimisticLike(videoId)

        await toggleLike(videoId, currentStats.userLiked)
    }

    const handleBookmark = async (videoId: string) => {
        if (!isAuthenticated) {
            openAuthDialog()
            return
        }

        const currentStats = getCurrentStats()
        updateOptimisticBookmark(videoId)

        await toggleBookmark(videoId, currentStats.userBookmarked)
    }

    const handleShare = async (videoId: string) => {
        if (!isAuthenticated) {
            openAuthDialog()
            return
        }

        updateOptimisticShare(videoId)
        await shareVideo(videoId)
    }

    const handleDownload = async (videoId: string) => {
        if (isAuthenticated) updateOptimisticDownload(videoId)

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
        if (!isAuthenticated) {
            openAuthDialog()
            return
        }
        const text = commentTexts.get(videoId)?.trim()
        if (!text) return

        // Clear comment text for this video
        setCommentTexts((prev) => {
            const newMap = new Map(prev)
            newMap.set(videoId, "")
            return newMap
        })

        const tempId = `temp-${Date.now()}`
        const tempComment = {
            id: tempId,
            msg: text,
            username: profile?.userName,
            profile_picture: profile?.profile_picture,
            isReply: false,
            likes: 0,
            replies: 0,
            userHasLiked: false,
            videoId: activeVideo.id,
            deleted: false,
        } as unknown as VideoComment

        updateOptimisticComment(videoId, tempComment)

        const res = await addComment(videoId, text)

        if (res?.commentId) {
            // TODO(fc8017f17e82):: replace temp comment Id with the one from db
        } else {
            console.error("Failed to add comment:", mutationError)
            removeOptimisticComment(videoId, tempId)
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

    const handleCommentLikeToggle = (commentId: string, videoId: string, wasLiked: boolean) => {
        if (!isAuthenticated) {
            openAuthDialog()
            return
        }

        updateOptimisticCommentLike(commentId, videoId)
        toggleCommentLike(commentId, videoId, wasLiked)
    }

    const handleCommentDelete = (commentId: string, videoId: string) => {
        if (!isAuthenticated) {
            openAuthDialog()
            return
        }

        removeOptimisticComment(videoId, commentId)
        deleteComment(commentId, videoId)
    }

    // fixes the different screen sizing issues
    // tells virtualizer to re-measure when the layout is loaded to the dom
    const stableRemeasure = useCallback(() => rowVirtualizer.measure(), [rowVirtualizer])
    useEffect(() => {
        stableRemeasure()
    }, [stableRemeasure])

    const isLoading = userMutationLoading || followingsLoading || mutationLoading
    const currentStats = getCurrentStats()

    const [showAuthDialog, setShowAuthDialog] = useState(false)
    const openAuthDialog = () => setShowAuthDialog(true)

    return (
        <>
            <DebugWindow>
                <div>
                    Active: {activeIndex + 1}/{allVideos.length}
                </div>
                <div>ID: {activeVideo?.id?.slice(-6)}</div>
                <div>Loading: {loading ? "Yes" : "No"}</div>
                <div>Fetching: {isFetchingNext ? "Yes" : "No"}</div>
                <div>parentSize: {parentRef.current?.clientHeight}</div>
                <br />

                <h1 className="text-orange-300">
                    first batch stats wil not change
                    <br />
                    Check fn <strong>onlyProd</strong>
                </h1>
            </DebugWindow>

            <InteractionsLoginPrompt
                open={showAuthDialog}
                closePrompt={() => setShowAuthDialog(false)}
            />

            <section className="h-[calc(100vh-6rem)] flex justify-center w-full">
                <ClientOnly>
                    {!isMobile && (
                        <div className="flex flex-col justify-center gap-5 rounded-full mr-[10%]">
                            <Button
                                className="rounded-full size-15"
                                variant={"secondary"}
                                onClick={movePrev}
                                disabled={activeIndex === 0}
                            >
                                <LucideChevronUp className="size-10 text-primary" />
                            </Button>
                            <Button
                                className="rounded-full size-15"
                                variant={"secondary"}
                                onClick={moveNext}
                                disabled={activeIndex === allVideos.length - 1}
                            >
                                <LucideChevronDown className="size-10 text-primary" />
                            </Button>
                        </div>
                    )}
                </ClientOnly>
                <div className="w-full md:w-4/6 h-full flex flex-row items-center justify-center md:p-2 md:gap-2">
                    <div
                        ref={parentRef}
                        data-root-scroll
                        className="flex-1 h-full overflow-y-auto snap-y snap-mandatory no-scrollbar"
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
                                            onEnded={() => {
                                                if (autoScrollEnabled) moveNext()
                                            }}
                                            autoScrollEnabled={autoScrollEnabled}
                                            setAutoScrollEnabled={setAutoScrollEnabled}
                                        />
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {isMobile ? (
                        <MobileInteractions
                            handleComment={(e: React.FormEvent) => handleComment(activeVideo.id, e)}
                            handleCommentDelete={handleCommentDelete}
                            handleCommentLikeToggle={handleCommentLikeToggle}
                            handleDownload={() => handleDownload(activeVideo.id)}
                            handleShare={() => handleShare(activeVideo.id)}
                            handleBookmark={() => handleBookmark(activeVideo.id)}
                            handleLikeToggle={() => handleLikeToggle(activeVideo.id)}
                            handleFollowToggle={() => handleFollowToggle(activeVideo.id)}
                            isLoading={isLoading}
                            error={mutationError || userMutationError}
                            currentStats={currentStats}
                            userFollowed={currentStats.isFollowing}
                            ownerProfilePicture={ownerProfile?.profile_picture}
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
                                handleCommentDelete={handleCommentDelete}
                                handleCommentLikeToggle={handleCommentLikeToggle}
                                handleDownload={() => handleDownload(activeVideo.id)}
                                handleShare={() => handleShare(activeVideo.id)}
                                handleBookmark={() => handleBookmark(activeVideo.id)}
                                handleLikeToggle={() => handleLikeToggle(activeVideo.id)}
                                handleFollowToggle={() => handleFollowToggle(activeVideo.id)}
                                isLoading={isLoading}
                                error={mutationError || userMutationError}
                                currentStats={currentStats}
                                userFollowed={currentStats.isFollowing}
                                ownerProfilePicture={ownerProfile?.profile_picture}
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
