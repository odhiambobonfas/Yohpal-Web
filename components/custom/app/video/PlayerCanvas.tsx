"use client"
import { useIsMobile } from "@/hooks/use-mobile"
import { Video } from "#/videos"
import DesktopPlayer from "./DesktopPlayer"
import MobilePlayer from "./MobilePlayer"
import DesktopSidePlayer from "./DesktopSidePlayer"
import { useEffect, useRef, useState } from "react"

export default function PlayerCanvas({ videos }: { videos: Video[] }) {
    const isMobile = useIsMobile()
    const refs = useRef<(HTMLDivElement | null)[]>([])
    const [activeVideoId, setActiveVideoId] = useState<string | null>(null)

    useEffect(() => {
        const rootEl = refs.current[0]?.parentElement
        if (!rootEl) return

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const id = entry.target.getAttribute("data-id")
                        if (id) setActiveVideoId(id)
                    }
                })
            },
            { threshold: 0.6, root: rootEl },
        )

        // snapshot to allow for proper cleanup
        const elements = [...refs.current]

        elements.forEach((el) => {
            if (el) observer.observe(el)
        })

        return () => {
            elements.forEach((el) => {
                if (el) observer.unobserve(el)
            })
        }
    }, [videos])

    if (isMobile) return <MobilePlayer video={videos[0]} />

    const activeVideo = videos.find((v) => v.id === activeVideoId) || videos[0]

    return (
        <section className="h-[calc(100vh-6rem)] flex justify-center w-full">
            <div className="w-5/6 h-full flex flex-row items-center justify-center p-2 gap-2">
                <div className="flex-1 aspect-9/16 h-full overflow-y-auto snap-y no-scrollbar snap-mandatory scroll-smooth">
                    {videos.map((video, idx) => (
                        <div
                            key={video.id}
                            data-id={video.id}
                            ref={(el) => {
                                refs.current[idx] = el
                            }}
                            className="snap-start my-2 h-full"
                        >
                            <DesktopPlayer
                                videoSrc={video.videoUrl}
                                videoId={video.id}
                                activeVideoId={activeVideoId || videos[0].id}
                            />
                        </div>
                    ))}
                </div>
                <DesktopSidePlayer video={activeVideo} />
            </div>
        </section>
    )
}
