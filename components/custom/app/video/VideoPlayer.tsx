"use client"
import { VideoPlayerProps } from "#/videos"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { DEFAULT_THUMBNAIL } from "@/constants"
import { useAutoPauseVideo } from "@/hooks/videos/auto-pause-video"
import { LucidePlay, LucideVolume2, LucideVolumeOff, MoreVertical } from "lucide-react"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"

export default function VideoPlayer({
    videoSrc,
    videoId,
    activeVideoId,
    thumbnail,
    index,
    activeIndex,
    onEnded,
    autoScrollEnabled,
    setAutoScrollEnabled,
}: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const [isLoaded, setIsLoaded] = useState(false)
    const [isMuted, setMuteStatus] = useState(true)
    const [isPlaying, setPlaying] = useState(true)

    useEffect(() => {
        function unlock() {
            setMuteStatus(false)
            window.removeEventListener("click", unlock)
            window.removeEventListener("touchstart", unlock)
        }

        window.addEventListener("click", unlock)
        window.addEventListener("touchstart", unlock)

        return () => {
            window.removeEventListener("click", unlock)
            window.removeEventListener("touchstart", unlock)
        }
    }, [])

    // load current +- 10
    const shouldRender = Math.abs(index - activeIndex) <= 10
    const isActive = activeVideoId === videoId
    useAutoPauseVideo(videoRef, {
        id: videoId,
        isActive,
        unloadOnPause: false,
        updatePlayState: setPlaying,
    })

    useEffect(() => {
        const el = videoRef.current
        if (!el) return

        if (isActive) {
            el.currentTime = 0
            el.play()
                .then(() => setPlaying(true))
                .catch(() => {})
        } else {
            el.pause()
            setPlaying(true)
        }
    }, [isActive])

    const togglePlayPause = async () => {
        const video = videoRef.current
        if (!video) return

        if (video.paused) {
            await video.play()
            setPlaying(true)
        } else {
            video.pause()
            setPlaying(false)
        }
    }

    if (!shouldRender) {
        return (
            <div className="h-full flex py-3">
                <Card className="h-full p-0 m-0 w-full overflow-hidden border-none">
                    <CardContent className="h-full p-0 relative flex items-center justify-center">
                        <Image
                            fill
                            quality={25}
                            src={thumbnail || DEFAULT_THUMBNAIL}
                            alt="video thumbnail"
                            className="object-cover"
                        />
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="h-full w-full flex m-0 py-3 px-1">
            <Card className="h-full p-0 m-0 w-full border-none overflow-hidden rounded-lg md:rounded-lg">
                <CardContent className="h-full p-0 relative flex items-center justify-center">
                    <Button
                        className="size-10 z-20 absolute top-2 left-2 hover:bg-transparent bg-transparent opacity-80"
                        onClick={() => setMuteStatus(!isMuted)}
                    >
                        {isMuted ? (
                            <LucideVolumeOff className="size-5 fill-current" />
                        ) : (
                            <LucideVolume2 className="size-5 fill-current" />
                        )}
                    </Button>
                    <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild className="absolute top-2 right-2 z-10">
                            <Button className="bg-transparent hover:bg-transparent" size="icon">
                                <MoreVertical className="fill-current" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className="min-w-56 relative"
                            align="end"
                            avoidCollisions
                        >
                            <DropdownMenuLabel className="text-muted-foreground">
                                Settings
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <div className="flex flex-col space-x-2 p-2">
                                <DropdownMenuItem className="flex flex-col" />
                                <div className="flex flex-row">
                                    <Switch
                                        id="enableAutoScroll"
                                        checked={autoScrollEnabled}
                                        onCheckedChange={(checked) => setAutoScrollEnabled(checked)}
                                    />
                                    <Label className="ms-3" htmlFor="enableAutoScroll">
                                        Autoscroll
                                    </Label>
                                </div>
                                <DropdownMenuItem />
                                <DropdownMenuItem className="">Report</DropdownMenuItem>
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {!isPlaying && (
                        <Button
                            onClick={togglePlayPause}
                            className="size-20 p-2 absolute flex items-center justify-center bg-primary/60 hover:bg-primary/50 rounded-full z-10 transition-opacity duration-300"
                        >
                            <LucidePlay className="fill-white stroke-white size-8" />
                        </Button>
                    )}
                    <video
                        ref={videoRef}
                        src={videoSrc}
                        className="w-full h-full object-cover"
                        loop={!autoScrollEnabled}
                        playsInline
                        muted
                        onClick={togglePlayPause}
                        onLoadedData={() => setIsLoaded(true)}
                        onEnded={autoScrollEnabled ? onEnded : undefined}
                    />
                    {!isLoaded && (
                        <div className="h-full w-full absolute inset-0">
                            <Image
                                quality={25}
                                width={100}
                                height={100}
                                src={thumbnail || DEFAULT_THUMBNAIL}
                                alt="video thumbnail"
                                className="h-full w-full object-cover"
                            />
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
