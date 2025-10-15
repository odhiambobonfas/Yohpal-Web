"use client"
import { useVirtualizer } from "@tanstack/react-virtual"
import { useSearchParams } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"
import useSWR, { mutate } from "swr"

import { VideoWithStats } from "#/videos"
import ClientOnly from "@/components/custom/ClientOnly"
import DebugWindow from "@/components/custom/DebugWindow"
import MobileInteractions from "@/components/custom/app/video/MobileInteractions"
import { useIsMobile } from "@/hooks/use-mobile"
import { useUser } from "@/hooks/user/use-user"
import useVideo from "@/hooks/videos/use-video"
import { useAuth } from "@/providers/Auth"
import { getWatchedVideos } from "@/services/client/user"

import { getPromotedVideosAction } from "@/actions/videos/promoted-videos"
import { Button } from "@/components/ui/button"
import { DEFAULT_PROFILE } from "@/constants"
import useVideoHandlers from "@/hooks/videos/use-video-handlers"
import { randomizeVideos } from "@/lib/randomize-videos"
import { videoMix } from "@/services/server/mixed-feed"
import { LucideChevronDown, LucideChevronUp } from "lucide-react"
import DesktopPlayerInteractions from "./DesktopPlayerInteractions"
import InteractionsLoginPrompt from "./InteractionsLoginPrompt"
import VideoPlayer from "./VideoPlayer"

const FETCH_TRIGGER_OFFSET = 10
const PROMOTED_VIDEO_BIAS = 3

const swrConfig = {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 6000,
    errorRetryCount: 2,
    revalidateOnMount: false,
}

export default function PlayerCanvas({
    videos,
    promotedVideos,
    lastVideoDoc,
    firstVideo,
}: {
    videos: VideoWithStats[]
    promotedVideos: VideoWithStats[] | undefined
    lastVideoDoc: string
    firstVideo: string | null
}) {
    const [allVideos, setAllVideos] = useState(videos)
    const [activeId, setActiveId] = useState<string | null>(videos[0]?.id ?? null)
    const [isFetchingNext, setIsFetchingNext] = useState(false)
    const [lastFetchedVideoId, setLastFetchedVideoId] = useState<string | null>(lastVideoDoc)
    const [lastPromotedDocId, setLastPromotedDocId] = useState<string | null>(null)
    const isMobile = useIsMobile()

    const { user, profile } = useAuth()
    const { getProfile, getFollowing } = useUser()

    const parentRef = useRef<HTMLDivElement | null>(null)

    const searchParams = useSearchParams()
    const userId = searchParams.get("u") || undefined
    const { loading, getClientPaginatedVideos } = useVideo(userId)

    const activeIndex = allVideos.findIndex((v) => v.id === activeId)
    const activeVideo = activeIndex && activeIndex >= 0 ? allVideos[activeIndex] : allVideos[0]

    function moveNext() {
        const currentIndex = allVideos.findIndex((v) => v.id === activeId)
        const nextId = currentIndex + 1
        if (nextId > allVideos.length - 1) return
        rowVirtualizer.scrollToIndex(nextId, {
            behavior: "smooth",
        })
    }

    function movePrev() {
        const currentIndex = allVideos.findIndex((v) => v.id === activeId)
        const nextId = currentIndex - 1
        if (nextId < 0) return
        rowVirtualizer.scrollToIndex(nextId, {
            behavior: "smooth",
        })
    }

    // Prefetches videoOwner details
    useEffect(() => {
        if (allVideos.length === 0) return

        const startIdx = activeIndex
        const endIdx = Math.min(allVideos.length, activeIndex + 5)
        const upcomingVideos = allVideos.slice(startIdx, endIdx)

        const uniqueUserIds = [...new Set(upcomingVideos.map((v) => v.userId))]

        uniqueUserIds.forEach((userId, index) => {
            setTimeout(() => {
                mutate([`user-profile`, userId], getProfile(userId), { revalidate: false })
            }, index * 100) // dedupe
        })
    }, [activeIndex, allVideos, getProfile])

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

    const videoHandlers = useVideoHandlers({
        activeVideo,
        followingData: userExtra?.[0],
        watchedVideos: userExtra?.[1],
    })

    const estimateSize = () => parentRef.current?.clientHeight ?? 850

    const rowVirtualizer = useVirtualizer({
        count: allVideos.length,
        getScrollElement: () => parentRef.current,
        estimateSize: estimateSize,
        overscan: 3,
    })

    const fetchNextVideos = useCallback(async () => {
        if (isFetchingNext || loading) return
        if (!lastFetchedVideoId) return

        setIsFetchingNext(true)

        const [newContent, promotedContent] = await Promise.all([
            getClientPaginatedVideos(lastFetchedVideoId, profile?.uid),
            getPromotedVideosAction(profile?.uid, lastPromotedDocId ?? undefined),
        ])

        if (newContent.videos?.length) {
            const existingIds = new Set(allVideos.map((v) => v.id))

            let uniqueNewVideos = newContent.videos.filter((v) => !existingIds.has(v.id))
            if (!userId) uniqueNewVideos = randomizeVideos(uniqueNewVideos)

            const uniquePromotedVideos = promotedContent.videos.filter(
                (v) => !existingIds.has(v.id),
            )

            const overallOffset = allVideos.length

            const mixed = videoMix(uniqueNewVideos, uniquePromotedVideos, 4, overallOffset)

            setAllVideos((prev) => [...prev, ...mixed])
            setLastFetchedVideoId(newContent.lastVideoDocId)

            setLastPromotedDocId(promotedContent.lastPromotedDoc)

            videoHandlers.handleStoreReset()
        }

        setIsFetchingNext(false)
    }, [
        allVideos,
        lastFetchedVideoId,
        lastPromotedDocId,
        profile?.uid,
        isFetchingNext,
        loading,
        getClientPaginatedVideos,
        userId,
        videoHandlers,
    ])

    useEffect(() => {
        if (videos.length > 0) {
            const targetVideo = firstVideo ? videos.find((v) => v.id === firstVideo) : null
            const otherVideos = firstVideo ? videos.filter((v) => v.id !== firstVideo) : videos
            const randomized = randomizeVideos(otherVideos)
            const randomizedPromoted = randomizeVideos(promotedVideos ?? [])
            const v = targetVideo ? [targetVideo, ...randomized] : randomized

            setAllVideos(videoMix(v, randomizedPromoted, PROMOTED_VIDEO_BIAS))

            if (promotedVideos && promotedVideos.length > 0) {
                setLastPromotedDocId(promotedVideos[promotedVideos.length - 1].id)
            }
        }
    }, [firstVideo, videos, promotedVideos])

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
                            videoHandlers.handleView()
                        }
                    }
                })
            },
            { threshold: 0.6, root: rootEl },
        )

        const videoElements = rootEl.querySelectorAll("[data-id]")
        videoElements.forEach((el) => observer.observe(el))

        return () => observer.disconnect()
    }, [virtualItems, activeId, user?.uid, videoHandlers])

    const [autoScrollEnabled, setAutoScrollEnabled] = useState(false)

    useEffect(() => {
        const saved = localStorage.getItem("autoscrollEnabled")
        if (saved !== null) {
            setAutoScrollEnabled(saved === "true")
        }
    }, [])
    useEffect(() => {
        localStorage.setItem("autoscrollEnabled", String(autoScrollEnabled))
    }, [autoScrollEnabled])

    // fixes the different screen sizing issues
    // tells virtualizer to re-measure when the layout is loaded to the dom
    const stableRemeasure = useCallback(() => rowVirtualizer.measure(), [rowVirtualizer])
    useEffect(() => {
        stableRemeasure()
    }, [stableRemeasure])

    const isLoading = followingsLoading || videoHandlers.isLoading
    const currentStats = videoHandlers.handleGetCurrentStats()

    return (
        <>
            <DebugWindow>
                <div>
                    Active: {activeIndex + 1}/{allVideos.length}
                </div>
                <div>promoted: {activeVideo.promoted ? "p" : ""}</div>
                <div>ID: {activeVideo?.id}</div>
                <div>Loading: {loading ? "Yes" : "No"}</div>
                <div>Fetching: {isFetchingNext ? "Yes" : "No"}</div>
                <div>parentSize: {parentRef.current?.clientHeight}</div>
                <span>LastFetchedDoc: {lastFetchedVideoId}</span>
                <br />

                <h1 className="text-orange-300">
                    first batch stats wil not change
                    <br />
                    Check fn <strong>onlyProd</strong>
                </h1>
            </DebugWindow>

            <InteractionsLoginPrompt
                open={videoHandlers.showAuthDialog}
                closePrompt={videoHandlers.closeAuthDialog}
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
                            handleComment={videoHandlers.handleComment}
                            handleCommentDelete={videoHandlers.handleCommentDelete}
                            handleCommentLikeToggle={videoHandlers.handleCommentLikeToggle}
                            handleDownload={videoHandlers.handleDownload}
                            handleShare={videoHandlers.handleShare}
                            handleBookmark={videoHandlers.handleBookmark}
                            handleLikeToggle={videoHandlers.handleLikeToggle}
                            handleFollowToggle={() =>
                                videoHandlers.handleFollowToggle(activeVideo.userId)
                            }
                            isLoading={isLoading}
                            error={videoHandlers.error}
                            currentStats={currentStats}
                            userFollowed={currentStats.isFollowing}
                            ownerProfilePicture={ownerProfile?.profile_picture || DEFAULT_PROFILE}
                            video={activeVideo}
                            commentMutation={{
                                text: videoHandlers.commentTexts.get(activeVideo.id) ?? "",
                                setText: (text: string) =>
                                    videoHandlers.handleCommentTextChange(activeVideo.id, text),
                                disabled: isLoading || profileLoading,
                            }}
                        />
                    ) : (
                        <ClientOnly>
                            <DesktopPlayerInteractions
                                handleComment={videoHandlers.handleComment}
                                handleCommentDelete={videoHandlers.handleCommentDelete}
                                handleCommentLikeToggle={videoHandlers.handleCommentLikeToggle}
                                handleDownload={videoHandlers.handleDownload}
                                handleShare={videoHandlers.handleShare}
                                handleBookmark={videoHandlers.handleBookmark}
                                handleLikeToggle={videoHandlers.handleLikeToggle}
                                handleFollowToggle={() =>
                                    videoHandlers.handleFollowToggle(activeVideo.userId)
                                }
                                isLoading={isLoading}
                                error={videoHandlers.error}
                                currentStats={currentStats}
                                userFollowed={currentStats.isFollowing}
                                ownerProfilePicture={
                                    ownerProfile?.profile_picture || DEFAULT_PROFILE
                                }
                                video={activeVideo}
                                commentMutation={{
                                    text: videoHandlers.commentTexts.get(activeVideo.id) ?? "",
                                    setText: (text: string) =>
                                        videoHandlers.handleCommentTextChange(activeVideo.id, text),
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
