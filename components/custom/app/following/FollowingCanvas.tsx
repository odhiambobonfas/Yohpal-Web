"use client"

import { Button } from "@/components/ui/button"
import {
    DEFAULT_PROFILE,
    DEFAULT_PROMOTED_VIDEO_BIAS,
    FOLLOWING_FEED_CURRENT_VID_KEY,
    FOLLOWING_FEED_KEY,
} from "@/constants"
import { useIsMobile } from "@/hooks/use-mobile"
import { useUser } from "@/hooks/user/use-user"
import useVideoHandlers from "@/hooks/videos/use-video-handlers"
import { logger } from "@/lib/logger"
import { useAuth } from "@/providers/Auth"
import { getWatchedVideos } from "@/services/client/user"
import { videoMix } from "@/services/server/mixed-feed"
import { FollowingFeed, VideoWithStats } from "@/types/videos"
import { useVirtualizer } from "@tanstack/react-virtual"
import { LucideChevronDown, LucideChevronUp } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import useSWR from "swr"
import ClientOnly from "../../ClientOnly"
import DebugWindow from "../../DebugWindow"
import AppAlert from "../AppAlert"
import DesktopPlayerInteractions from "../video/DesktopPlayerInteractions"
import MobileInteractions from "../video/MobileInteractions"
import VideoPlayer from "../video/VideoPlayer"

export default function FollowingCanvas({ promotedVideos }: { promotedVideos: VideoWithStats[] }) {
    const swrConfig = {
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
        dedupingInterval: 6000,
        errorRetryCount: 2,
        revalidateOnMount: false,
    }

    const router = useRouter()
    const parentRef = useRef<HTMLDivElement | null>(null)
    const isMobile = useIsMobile()
    const { profile } = useAuth()
    const { getProfile, getFollowing } = useUser()

    const [feedErr, showFeedErr] = useState(false)
    const [activeVideoId, setActiveVideoId] = useState("")
    const [feed, setFeed] = useState<VideoWithStats[]>([])
    const [autoScrollEnabled, setAutoScrollEnabled] = useState(false)

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

        setFeed(interleavedVideos)
        setActiveVideoId(currentVideoId)
    }, [promotedVideos])

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

    const activeVideoIdx = feed.findIndex((v) => v.id === activeVideoId)
    const activeVideo =
        activeVideoIdx && activeVideoIdx >= 0
            ? feed[activeVideoIdx]
            : promotedVideos[activeVideoIdx]

    logger.debug("activeVideo", activeVideoIdx)
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

    const isLoading = videoHandlers.isLoading
    const currentStats = videoHandlers.handleGetCurrentStats()

    if (feedErr) {
        return (
            <AppAlert
                type="error"
                isOpen={feedErr}
                title="Sth went wrong"
                description="stuff"
                onAction={() => router.back()}
            />
        )
    }
    return (
        <>
            <DebugWindow>
                <p>All videos: {feed.length}</p>
                <p>
                    active {activeVideoIdx}/{feed.length}
                </p>
                <p>PromotedVideos: {promotedVideos.length}</p>
                <p>ActiveVideoId: {activeVideo?.id} </p>
                <p>ActiveVideoIdx: {activeVideoIdx}</p>
            </DebugWindow>

            <h1>Canvas</h1>
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
                                // const video = activeVideo
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
