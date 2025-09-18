import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"

export default function VideoPlayer({
    videoSrc,
    videoId,
    activeVideoId,
    thumbnail,
    index,
    activeIndex,
}: {
    videoId: string
    videoSrc: string
    activeVideoId: string
    thumbnail?: string
    index: number
    activeIndex: number
}) {
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const [isLoaded, setIsLoaded] = useState(false)

    // load current +- 10
    const shouldRender = Math.abs(index - activeIndex) <= 10
    const isActive = activeVideoId === videoId

    useEffect(() => {
        const el = videoRef.current
        if (!el) return

        if (isActive) {
            el.currentTime = 0
            el.play().catch(() => {})
        } else {
            el.pause()
        }
    }, [isActive])

    if (!shouldRender) {
        return (
            <div className="h-full flex">
                <Card className="h-full p-0 m-0 w-full overflow-hidden">
                    <CardContent className="h-full p-0 relative flex items-center justify-center">
                        <Image
                            fill
                            src={thumbnail || "/logo_circular.png"}
                            alt="video thumbnail"
                            className="object-cover"
                        />
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="h-full flex">
            <Card className="h-full p-0 m-0 w-full overflow-hidden">
                <CardContent className="h-full p-0 relative flex items-center justify-center">
                    <video
                        ref={videoRef}
                        src={videoSrc}
                        className="w-full aspect-9/16 h-full object-cover"
                        loop
                        muted
                        playsInline
                        onLoadedData={() => setIsLoaded(true)}
                    />
                    {!isLoaded && (
                        <div className="absolute inset-0">
                            <Image
                                fill
                                src={thumbnail || "/logo_circular.png"}
                                alt="video thumbnail"
                                className="object-cover"
                            />
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
