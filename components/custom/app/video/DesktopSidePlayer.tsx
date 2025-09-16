"use client"
import { Video } from "#/videos"
import { useUser } from "@/hooks/user/use-user"
import { useVideo } from "@/hooks/videos/use-video"
import { useAuth } from "@/providers/Auth"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    LucideBookmark,
    LucideDownload,
    LucideEye,
    LucideHeart,
    LucideMessageCircleMore,
    LucideSend,
    LucideShare2,
    LucideUserPlus2,
} from "lucide-react"
import useSWR from "swr"

export default function DesktopSidePlayer({ video }: { video: Video }) {
    const { isAuthenticated } = useAuth()
    const { getProfile } = useUser()
    const { getVideoStats } = useVideo()

    const swrConfig = {
        revalidateOnFocus: false, // Don't refetch on window focus
        revalidateOnReconnect: true,
        dedupingInterval: 60000,
        errorRetryCount: 3, // Retry failed requests 3 times
    }

    const { data: stats } = useSWR(
        [`video-stats`, video.id],
        ([_, videoId]) => getVideoStats(videoId),
        {},
    )

    const { data: ownerProfile } = useSWR(
        [`user-profile`, video.userId],
        ([, userId]) => getProfile(userId),
        swrConfig,
    )
    return (
        <div className="w-6/12 px-3 gap-3 flex flex-col h-full">
            <Card className="w-full m-0 p-0 min-h-28">
                <CardContent className="w-full p-4">
                    <div className="inline-flex items-center gap-4 justify-between w-full">
                        <div className="w-4/6 inline-flex items-center gap-2">
                            <Avatar className="size-8">
                                <AvatarImage
                                    loading="lazy"
                                    width={50}
                                    height={50}
                                    src={ownerProfile?.profile_picture || "/app/auth-bg.jpg"}
                                    alt={`${video.userName}'s profile picture`}
                                />
                                <AvatarFallback>{video.userName[0]}</AvatarFallback>
                            </Avatar>

                            <span className="flex flex-col items-start">
                                <b>@{video.userName}</b>
                                <span className="text-muted-foreground text-sm">
                                    {video.fullName}
                                </span>
                            </span>
                        </div>

                        {isAuthenticated && (
                            <Button className="rounded-full text-lg px-5 py-2">
                                <LucideUserPlus2 /> Follow
                            </Button>
                        )}
                    </div>
                    {video.caption && (
                        <p className="py-2 text-foreground text-lg">{video.caption}</p>
                    )}
                    <div className="inline-flex gap-2">
                        {video.tags && video.tags.map((t, idx) => <span key={idx}>{t}</span>)}
                    </div>
                </CardContent>
            </Card>

            <div className="flex flex-col items-center w-full">
                <div className="inline-flex gap-1 w-full">
                    <Button variant={"ghost"} className="text-foreground">
                        <LucideEye />
                        {stats?.views || 0}
                    </Button>
                    <Button variant={"ghost"} className="text-foreground">
                        <LucideHeart />
                        {stats?.likes || 0}
                    </Button>
                    <Button variant={"ghost"} className="text-foreground">
                        <LucideMessageCircleMore /> 0
                    </Button>
                    <Button variant={"ghost"} className="text-foreground">
                        <LucideShare2 />
                        {stats?.shares || 0}
                    </Button>
                    <Button variant={"ghost"} className="text-foreground">
                        <LucideBookmark /> {stats?.bookmarks || 0}
                    </Button>

                    <Button variant={"ghost"} className="text-foreground">
                        <LucideDownload /> {stats?.downloads || 0}
                    </Button>
                </div>
            </div>
            <div className="h-full py-3 w-full flex flex-col">
                <form className="inline-flex w-full items-center gap-2 h-10">
                    <Input
                        type="text"
                        className="rounded-full p-3 text-lg"
                        placeholder="What's going on..."
                    />
                    <Button className="rounded-full">
                        <LucideSend />
                    </Button>
                </form>

                <ScrollArea className="flex-1 h-1/2 overflow-hidden p-3"></ScrollArea>
            </div>
        </div>
    )
}
