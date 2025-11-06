"use client"

import { getPromotedVideosAction } from "@/actions/videos/promoted-videos"
import AppAlert from "@/components/custom/app/AppAlert"
import DesktopPlayerInteractions from "@/components/custom/app/video/DesktopPlayerInteractions"
import MobileInteractions from "@/components/custom/app/video/MobileInteractions"
import VideoPlayer from "@/components/custom/app/video/VideoPlayer"
import ClientOnly from "@/components/custom/ClientOnly"
import DebugWindow from "@/components/custom/DebugWindow"
import { Button } from "@/components/ui/button"
import {
    DEFAULT_PROFILE,
    DEFAULT_PROMOTED_VIDEO_BIAS,
    FETCH_TRIGGER_OFFSET,
    FOLLOWING_FEED_CURRENT_VID_KEY,
    FOLLOWING_FEED_KEY,
    PROMOTED_VIDEOS_LIMIT,
} from "@/constants"

import { useIsMobile } from "@/hooks/use-mobile"
import { useUser } from "@/hooks/user/use-user"
import useFollowingVideos from "@/hooks/videos/use-following-videos"
import useVideoHandlers from "@/hooks/videos/use-video-handlers"
import { randomizeVideos } from "@/lib/randomize-videos"
import { getLast } from "@/lib/utils"
import { useAuth } from "@/providers/Auth"
import { getWatchedVideos } from "@/services/client/user"
import { videoMix } from "@/services/server/mixed-feed"
import { FollowingFeed, FollowingFeedMeta, VideoWithStats } from "@/types/videos"
import { useVirtualizer } from "@tanstack/react-virtual"
import { LucideChevronDown, LucideChevronUp } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"
import useSWR from "swr"
import KeyShortcuts from "../KeyShortcuts"

const swrConfig = {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 6000,
    errorRetryCount: 2,
    revalidateOnMount: false,
}

export default function FollowingCanvas({ promotedVideos }: { promotedVideos: VideoWithStats[] }) {
    const router = useRouter()
    const parentRef = useRef<HTMLDivElement | null>(null)
    const isMobile = useIsMobile()
    const { profile } = useAuth()
    const { getProfile, getFollowing } = useUser()
    const { loading, getFollowingVideos: getFollowingVideosBatch } = useFollowingVideos()

    const [feedErr, showFeedErr] = useState(false)
    const [activeVideoId, setActiveVideoId] = useState("")
    const [feed, setFeed] = useState<VideoWithStats[]>([])
    const [autoScrollEnabled, setAutoScrollEnabled] = useState(false)
    const [isFetchingNext, setIsFetchingNext] = useState(false)
    const [followingMeta, setFollowingMeta] = useState<FollowingFeedMeta | null>(null)
    const [lastPromotedDocId, setLastPromotedDocId] = useState(getLast(promotedVideos)?.id)

    useEffect(() => {
        const followingFeed = sessionStorage.getItem(FOLLOWING_FEED_KEY)
        const currentVideoId = sessionStorage.getItem(FOLLOWING_FEED_CURRENT_VID_KEY)

        if (!followingFeed || !currentVideoId) {
            showFeedErr(true)
            return
        }
        const parsedFollowingFeed = JSON.parse(followingFeed!) as FollowingFeed
        const interleavedVideos = videoMix(
            parsedFollowingFeed.videos,
            promotedVideos,
            DEFAULT_PROMOTED_VIDEO_BIAS,
            parsedFollowingFeed.videos.length,
        )

        setFollowingMeta(parsedFollowingFeed.followingMeta)
        setFeed(interleavedVideos)
        setActiveVideoId(currentVideoId)
    }, [promotedVideos])

    const activeVideoIdx = feed.findIndex((v) => v.id === activeVideoId)
    const activeVideo = activeVideoIdx >= 0 ? feed[activeVideoIdx] : promotedVideos[0]

    const fetchNextBatch = useCallback(async () => {
        setIsFetchingNext(true)
        if (!followingMeta) return

        const nextBatch = await getFollowingVideosBatch(followingMeta)

        if (nextBatch.videos.length > 0) {
            const promotedContent = await getPromotedVideosAction(
                profile?.uid,
                PROMOTED_VIDEOS_LIMIT,
                lastPromotedDocId,
            )
            setLastPromotedDocId(promotedContent.lastPromotedDoc || undefined)

            const existingIds = new Set(feed.map((v) => v.id))
            const uniqueNewVideos = nextBatch.videos.filter((v) => !existingIds.has(v.id))

            const mixedFeed = videoMix(
                uniqueNewVideos,
                randomizeVideos(promotedContent.videos),
                DEFAULT_PROMOTED_VIDEO_BIAS,
                feed.length,
            )

            setFeed((prev) => [...prev, ...mixedFeed])
        }

        setFollowingMeta(nextBatch.followingMeta)
        setIsFetchingNext(false)
    }, [followingMeta, getFollowingVideosBatch, feed, lastPromotedDocId, profile?.uid])

    useEffect(() => {
        if (loading || isFetchingNext) return
        const triggerIdx = feed.length - FETCH_TRIGGER_OFFSET
        if (activeVideoIdx > 0 && activeVideoIdx >= triggerIdx) {
            fetchNextBatch()
        }
    }, [activeVideoId, feed.length, fetchNextBatch, isFetchingNext, loading, activeVideoIdx])

    const estimateSize = () => parentRef.current?.clientHeight ?? 850

    const rowVirtualizer = useVirtualizer({
        count: feed.length,
        getScrollElement: () => parentRef.current,
        estimateSize: estimateSize,
        overscan: 3,
    })

    function moveNext() {
        const currentIndex = feed.findIndex((v) => v.id === activeVideoId)
        const nextId = currentIndex + 1
        if (nextId > feed.length - 1) return
        rowVirtualizer.scrollToIndex(nextId, {
            behavior: "smooth",
        })
    }

    function movePrev() {
        const currentIndex = feed.findIndex((v) => v.id === activeVideoId)
        const nextId = currentIndex - 1
        if (nextId < 0) return
        rowVirtualizer.scrollToIndex(nextId, {
            behavior: "smooth",
        })
    }

    const { data: userExtra } = useSWR(
        ["user-extra", profile?.uid],
        async ([, uid]) => {
            if (!uid) return [[], []]
            return await Promise.all([getFollowing(uid), getWatchedVideos(uid)])
        },
        swrConfig,
    )

    const { data: ownerProfile } = useSWR(
        [`user-profile`, activeVideo?.userId],
        ([, userId]) => getProfile(userId),
        swrConfig,
    )
    const videoHandlers = useVideoHandlers({
        activeVideo,
        followingData: userExtra?.[0],
        watchedVideos: userExtra?.[1],
    })

    const virtualItems = rowVirtualizer.getVirtualItems()
    useEffect(() => {
        const rootEl = parentRef.current
        if (!rootEl) return

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const id = entry.target.getAttribute("data-id")
                        if (id && id !== activeVideoId) {
                            setActiveVideoId(id)
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
    }, [virtualItems, activeVideoId, videoHandlers])

    const isLoading = videoHandlers.isLoading
    const currentStats = videoHandlers.handleGetCurrentStats()

    if (feedErr) {
        return (
            <AppAlert
                type="error"
                isOpen={feedErr}
                title="Following feed"
                description="Something went wrong on our end"
                actionText="Retry"
                showCancel={false}
                onAction={() => router.back()}
            />
        )
    }
    return (
        <>
            <KeyShortcuts nextVideo={moveNext} prevVideo={movePrev} />
            <DebugWindow>
                <p>
                    Active Video {activeVideoIdx + 1}/{feed.length}
                </p>
                <p> Fetching next: {isFetchingNext ? "Y" : "N"}</p>
                <p>PromotedVideos: {promotedVideos.length}</p>
                <p>ActiveVideoId: {activeVideo?.id} </p>
                <p>Handlers Loading: {isLoading ? "y" : "n"}</p>
                <p>LastPromoted: {lastPromotedDocId}</p>
            </DebugWindow>

            <section className="h-[calc(100vh-6rem)] flex justify-center w-full">
                <ClientOnly>
                    {!isMobile && (
                        <div className="flex flex-col justify-center gap-5 rounded-full mr-[10%]">
                            <Button
                                className="rounded-full size-15"
                                variant={"secondary"}
                                onClick={movePrev}
                                disabled={activeVideoIdx === 0}
                            >
                                <LucideChevronUp className="size-10 text-primary" />
                            </Button>
                            <Button
                                className="rounded-full size-15"
                                variant={"secondary"}
                                onClick={moveNext}
                                disabled={activeVideoIdx === feed.length - 1}
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
                                const video = feed[virtualRow.index]
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
                                            activeIndex={activeVideoIdx}
                                            onEnded={() => {
                                                if (autoScrollEnabled) moveNext()
                                            }}
                                            autoScrollEnabled={autoScrollEnabled}
                                            setAutoScrollEnabled={setAutoScrollEnabled}
                                            promoted={video.promoted}
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
                            error={videoHandlers.error}
                            currentStats={currentStats}
                            userFollowed={currentStats.isFollowing}
                            ownerProfilePicture={ownerProfile?.profile_picture || DEFAULT_PROFILE}
                            video={activeVideo}
                            commentMutation={{
                                text: videoHandlers.commentTexts.get(activeVideo.id) ?? "",
                                setText: (text: string) =>
                                    videoHandlers.handleCommentTextChange(activeVideo.id, text),
                                disabled: isLoading,
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
                                    disabled: isLoading,
                                }}
                            />
                        </ClientOnly>
                    )}
                </div>
            </section>
        </>
    )
}
