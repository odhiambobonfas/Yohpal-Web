"use client"
import { useIsMobile } from "@/hooks/use-mobile"
import { Video } from "#/videos"
import VideoPlayer from "./VideoPlayer"
import DesktopSidePlayer from "./DesktopSidePlayer"
import { useCallback, useEffect, useRef, useState } from "react"
import { useVideo } from "@/hooks/videos/use-video"
import DebugWindow from "@/components/custom/DebugWindow"
import { useVirtualizer } from "@tanstack/react-virtual"
import useVideoMutation from "@/hooks/videos/use-video-mutations"
import { ResponsiveShareDialog } from "./ResponsiveShareDialog"
import { Button } from "@/components/ui/button"

const FETCH_TRIGGER_OFFSET = 10

export default function PlayerCanvas({ videos }: { videos: Video[] }) {
    const [allVideos, setAllVideos] = useState(videos)
    const [activeId, setActiveId] = useState<string | null>(videos[0]?.id ?? null)
    const [isFetchingNext, setIsFetchingNext] = useState(false)
    const [lastFetchedVideoId, setLastFetchedVideoId] = useState<string | null>(null)

    const {
        loading: mutationLoading,
        error: mutationError,
        toggleLike,
        toggleBookmark,
        addComment,
        shareVideo,
        downloadVideo,
    } = useVideoMutation()

    const parentRef = useRef<HTMLDivElement | null>(null)
    const isMobile = useIsMobile()
    const { loading, getPaginatedVideos } = useVideo()

    const estimateSize = () => parentRef.current?.clientHeight ?? 850

    const rowVirtualizer = useVirtualizer({
        count: allVideos.length,
        getScrollElement: () => parentRef.current,
        estimateSize: estimateSize,
        overscan: 3,
    })

    const activeIndex = allVideos.findIndex((v) => v.id === activeId)
    const activeVideo = activeIndex >= 0 ? allVideos[activeIndex] : allVideos[0]

    useEffect(() => {
        if (loading || isFetchingNext) return
        const triggerIndex = allVideos.length - FETCH_TRIGGER_OFFSET
        if (activeIndex >= triggerIndex) {
            void fetchNextVideos()
        }
    }, [activeIndex, allVideos.length, loading, isFetchingNext])

    const fetchNextVideos = useCallback(async () => {
        if (isFetchingNext || loading) return
        const lastVideo = allVideos[allVideos.length - 1]
        if (!lastVideo || lastFetchedVideoId === lastVideo.id) return

        setIsFetchingNext(true)
        setLastFetchedVideoId(lastVideo.id)

        const newVideos = await getPaginatedVideos(lastVideo.id)
        if (newVideos?.length) {
            setAllVideos((prev) => [...prev, ...newVideos])
        }

        setIsFetchingNext(false)
    }, [allVideos, lastFetchedVideoId, isFetchingNext, loading, getPaginatedVideos])

    // watch active video
    useEffect(() => {
        const virtualItems = rowVirtualizer.getVirtualItems()
        if (virtualItems.length === 0) return

        const viewportHeight = parentRef.current?.clientHeight ?? window.innerHeight
        const viewportCenter = (parentRef.current?.scrollTop ?? 0) + viewportHeight / 2

        let closest = virtualItems[0]
        let closestDist = Math.abs(viewportCenter - (closest.start + closest.size / 2))

        for (const v of virtualItems) {
            const vCenter = v.start + v.size / 2
            const dist = Math.abs(viewportCenter - vCenter)
            if (dist < closestDist) {
                closest = v
                closestDist = dist
            }
        }

        const newId = allVideos[closest.index]?.id ?? null
        if (newId && newId !== activeId) {
            setActiveId(newId)
        }
    }, [rowVirtualizer.getVirtualItems(), allVideos, activeId])

    if (isMobile) {
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

                <ResponsiveShareDialog videoId={activeVideo.id}>
                    <Button variant={"secondary"}>hello</Button>
                </ResponsiveShareDialog>
                <section className="h-[calc(100vh-6rem)] flex justify-center w-full">
                    <div className="w-full h-full flex flex-row items-center justify-center p-2 gap-2">
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
                                            className="absolute top-0 left-0 my-2 w-full snap-start"
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
                    </div>
                </section>
            </>
        )
    }

    return (
        <>
            <DebugWindow>
                <div>
                    Active: {activeIndex + 1}/{allVideos.length}
                </div>
                <div>ID: {activeVideo?.id}</div>
                <div>Loading: {loading ? "Yes" : "No"}</div>
                <div>Fetching: {isFetchingNext ? "Yes" : "No"}</div>
            </DebugWindow>
            <section className="h-[calc(100vh-6rem)] flex justify-center w-full">
                <div className="w-5/6 h-full flex flex-row items-center justify-center p-2 gap-2">
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
                                        className="absolute top-0 left-0 my-2 w-full snap-start"
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
                    <DesktopSidePlayer
                        video={activeVideo}
                        onToggleLike={toggleLike}
                        onToggleBookmark={toggleBookmark}
                        onAddComment={addComment}
                        onShare={shareVideo}
                        onDownload={downloadVideo}
                        mutationError={mutationError}
                        mutationLoading={mutationLoading}
                    />
                </div>
            </section>
        </>
    )
}
