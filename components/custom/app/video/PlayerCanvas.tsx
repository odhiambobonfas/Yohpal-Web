"use client"
import { VideoWithStats } from "#/videos"
import VideoPlayer from "./VideoPlayer"
import { useCallback, useEffect, useRef, useState } from "react"
import { useVideo } from "@/hooks/videos/use-video"
import DebugWindow from "@/components/custom/DebugWindow"
import { useVirtualizer } from "@tanstack/react-virtual"
import { useSearchParams } from "next/navigation"
import Interactions from "./Interactions"
import { useVideoMutation } from "@/hooks/videos/use-video-mutations"
import { useAuth } from "@/providers/Auth"

const FETCH_TRIGGER_OFFSET = 10

export default function PlayerCanvas({ videos }: { videos: VideoWithStats[] }) {
    const [allVideos, setAllVideos] = useState(videos)
    const [activeId, setActiveId] = useState<string | null>(videos[0]?.id ?? null)
    const [isFetchingNext, setIsFetchingNext] = useState(false)
    const [lastFetchedVideoId, setLastFetchedVideoId] = useState<string | null>(null)
    const { user } = useAuth()

    const searchParams = useSearchParams()
    const userId = searchParams.get("u") || undefined

    const parentRef = useRef<HTMLDivElement | null>(null)
    const { loading, getClientPaginatedVideos } = useVideo(user?.uid)
    const { addView } = useVideoMutation()

    const estimateSize = () => parentRef.current?.clientHeight ?? 850

    const rowVirtualizer = useVirtualizer({
        count: allVideos.length,
        getScrollElement: () => parentRef.current,
        estimateSize: estimateSize,
        overscan: 3,
    })

    const activeIndex = allVideos.findIndex((v) => v.id === activeId)
    const activeVideo = activeIndex >= 0 ? allVideos[activeIndex] : allVideos[0]

    const fetchNextVideos = useCallback(async () => {
        if (isFetchingNext || loading) return
        const lastVideo = allVideos[allVideos.length - 1]
        if (!lastVideo || lastFetchedVideoId === lastVideo.id) return

        setIsFetchingNext(true)
        setLastFetchedVideoId(lastVideo.id)

        const newVideos = await getClientPaginatedVideos(lastVideo.id)
        if (newVideos?.length) {
            // skips shared video as its already been watched, no need to show it again
            const existingIds = new Set(allVideos.map((v) => v.id))
            const uniqueNewVideos = newVideos.filter((v) => !existingIds.has(v.id))
            setAllVideos((prev) => [...prev, ...uniqueNewVideos])
        }

        setIsFetchingNext(false)
    }, [allVideos, lastFetchedVideoId, isFetchingNext, loading, getClientPaginatedVideos, userId])

    useEffect(() => {
        if (loading || isFetchingNext) return
        const triggerIndex = allVideos.length - FETCH_TRIGGER_OFFSET
        if (activeIndex >= triggerIndex) {
            void fetchNextVideos()
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
                            addView(id, user?.uid)
                        }
                    }
                })
            },
            { threshold: 0.6, root: rootEl },
        )

        // watch all currently rendered video elements
        const videoElements = rootEl.querySelectorAll("[data-id]")
        videoElements.forEach((el) => observer.observe(el))

        return () => observer.disconnect()
    }, [virtualItems, activeId])

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
                    <Interactions video={activeVideo} />
                </div>
            </section>
        </>
    )
}
