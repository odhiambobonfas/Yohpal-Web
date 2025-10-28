"use client"

import { VideoWithStats } from "@/types/videos"
import { LucideHeart } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useCallback } from "react"

interface VideoPreviewProps {
    video: VideoWithStats
    userId: string
    feed: unknown
}

export default function VideoPreview({ video, userId, feed }: VideoPreviewProps) {
    const handleClick = useCallback(() => {
        sessionStorage.setItem("feedData", JSON.stringify(feed))
        sessionStorage.setItem("currentId", video.id)
    }, [feed, video.id])

    return (
        <Link
            href="/following/feed"
            key={video.id}
            onClick={handleClick}
            className="h-70 relative w-full bg-secondary/40 shadow-md rounded-lg flex flex-col overflow-hidden"
        >
            <div className="h-full w-full bg-slate-100/10">
                <Image
                    src={video.thumbnail}
                    className="flex bg-slate-100/10 h-full w-full object-cover"
                    alt="video thumbnail"
                    width={100}
                    height={100}
                />
            </div>
            <div className="absolute text-white bottom-0 w-full h-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex justify-center items-end gap-2 px-4 py-3">
                {video.userName}
                <div className="inline-flex gap-1 text-sm items-center">
                    <LucideHeart
                        className={`size-4 ${video.likes.includes(userId) ? "text-red-500 fill-current" : ""}`}
                    />{" "}
                    {video.likes.length}
                </div>
            </div>
        </Link>
    )
}
