"use client"
import {
    Bookmark,
    Heart,
    History,
    LucideBan,
    LucideEye,
    LucideHeart,
    LucideUpload,
    Upload,
} from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VideoWithStats } from "@/types/videos"

import ProfileVideoLoading from "./ProfileVideoLoading"

interface ProfileVideosSectionProps {
    uploads: VideoWithStats[] | undefined
    liked: VideoWithStats[] | undefined
    bookmarked: VideoWithStats[] | undefined
    history: VideoWithStats[] | undefined
}
export default function ProfileVideosSection({
    loading,
    videos,
    profileType,
}: {
    loading: boolean
    profileType: "personal" | "public"
    videos: ProfileVideosSectionProps
}) {
    if (profileType === "public") {
        return (
            <section className="h-full w-full flex flex-col items-center md:items-start gap-2 p-3">
                <div className="inline-flex gap-2 bg-accent py-2 items-center w-fit px-4 rounded-lg">
                    <LucideUpload className="size-4 text-primary" />
                    Uploads
                </div>
                <ScrollArea className="h-[calc(100%-4rem)] w-full">
                    {loading && <ProfileVideoLoading />}
                    {!loading && videos.uploads && videos.uploads.length > 0 ? (
                        <ProfileVideoPreview videos={videos.uploads} />
                    ) : (
                        !loading && <ProfileNoVideos />
                    )}
                </ScrollArea>
            </section>
        )
    }

    return (
        <div className="">
            <Tabs defaultValue="uploads">
                <TabsList className="bg-accent">
                    <TabsTrigger value="uploads">
                        <Upload /> Uploads
                    </TabsTrigger>
                    <TabsTrigger value="liked">
                        <Heart /> Liked
                    </TabsTrigger>
                    <TabsTrigger value="bookmarked">
                        <Bookmark /> Bookmarked
                    </TabsTrigger>
                    <TabsTrigger value="history">
                        <History /> History
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="uploads">
                    {loading ? (
                        <ProfileVideoLoading />
                    ) : videos.uploads && videos.uploads.length > 0 ? (
                        <ScrollableVideoPreview videos={videos.uploads} />
                    ) : (
                        <ProfileNoVideos />
                    )}
                </TabsContent>
                <TabsContent value="liked">
                    {videos.liked ? (
                        <ScrollableVideoPreview videos={videos.liked} />
                    ) : (
                        <ProfileNoVideos />
                    )}
                </TabsContent>
                <TabsContent value="bookmarked">
                    {videos.bookmarked ? (
                        <ScrollableVideoPreview videos={videos.bookmarked} />
                    ) : (
                        <ProfileNoVideos />
                    )}
                </TabsContent>
                <TabsContent value="history">
                    {videos.history ? (
                        <ScrollableVideoPreview videos={videos.history} />
                    ) : (
                        <ProfileNoVideos />
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}

function ScrollableVideoPreview({ videos }: { videos: VideoWithStats[] }) {
    return (
        <ScrollArea className="h-[70svh]">
            <ProfileVideoPreview videos={videos} />
        </ScrollArea>
    )
}

function ProfileVideoPreview({ videos }: { videos: VideoWithStats[] }) {
    const router = useRouter()
    return (
        <div className="grid grid-cols-3 md:grid-cols-5 gap-2 p-2">
            {videos.map((v) => (
                <div
                    key={v.id}
                    onClick={() => router.push(viewProfileVideos(v.userId, v.id))}
                    className="relative overflow-hidden rounded-lg cursor-pointer aspect-[9/16]"
                >
                    <Image
                        src={v.thumbnail}
                        fill
                        alt="thumbnail"
                        className="h-full w-full object-cover"
                    />
                    <VideoStats video={v} />
                </div>
            ))}
        </div>
    )
}

function ProfileNoVideos() {
    return (
        <div className="w-full flex items-center justify-center">
            <div className="w-11/12 p-5 bg-primary/5 shadow-lg rounded-lg flex flex-col items-center gap-3">
                <LucideBan className="size-10 text-muted-foreground" />
                <span className="capitalize font-semibold text-muted-foreground text-2xl">
                    no videos
                </span>
            </div>
        </div>
    )
}

function VideoStats({ video }: { video: VideoWithStats }) {
    return (
        <div>
            <div className="absolute bottom-0 w-full h-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex justify-center items-end gap-2 px-4 py-3"></div>
            <div className="flex justify-around absolute bottom-2 w-full z-10">
                <div className="text-slate-200 text-xs bg-transparent size-10 flex items-center justify-center flex-col">
                    <LucideHeart className="size-5" />
                    <span>{video.likesCount || 0}</span>
                </div>
                <div className="text-slate-100 text-xs bg-transparent size-10 flex items-center justify-center flex-col">
                    <LucideEye className="size-5" />
                    <span>{video.viewsCount || 0}</span>
                </div>
            </div>
        </div>
    )
}

function viewProfileVideos(userId: string, videoId: string) {
    const params = new URLSearchParams({
        u: userId,
        v: videoId,
    })
    return `/?${params.toString()}`
}
