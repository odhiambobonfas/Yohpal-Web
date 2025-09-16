import { Card, CardContent } from "@/components/ui/card"
import { useEffect, useRef } from "react"

export default function DesktopPlayer({
    videoSrc,
    videoId,
    activeVideoId,
}: {
    videoId: string
    videoSrc: string

    activeVideoId: string
}) {
    const videoRef = useRef<HTMLVideoElement | null>(null)
    useEffect(() => {
        if (!videoRef.current) return
        if (activeVideoId === videoId) {
            videoRef.current.currentTime = 0
            videoRef.current.play().catch(() => {})
        } else {
            videoRef.current.pause()
        }
    }, [activeVideoId, videoId])

    return (
        <div className="h-full flex ">
            <Card className="h-full p-0 m-0 w-full overflow-hidden">
                <CardContent className="h-full p-0">
                    <video
                        src={videoSrc}
                        ref={videoRef}
                        className="w-full aspect-9/16 h-full object-cover"
                        loop
                        muted
                    ></video>
                </CardContent>
            </Card>
        </div>
    )
}
