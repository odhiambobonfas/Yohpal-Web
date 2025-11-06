"use client"

import { FOLLOWING_FEED_CURRENT_VID_KEY, FOLLOWING_FEED_KEY } from "@/constants"
import { FollowingFeed, VideoWithStats } from "@/types/videos"
import { LucideHeart } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useCallback } from "react"

interface VideoPreviewProps {
    video: VideoWithStats
    userId: string
    feed: FollowingFeed
}

export default function FollowingVideoPreview({ video, userId, feed }: VideoPreviewProps) {
    const handleClick = useCallback(() => {
        sessionStorage.setItem(FOLLOWING_FEED_KEY, JSON.stringify(feed))
        sessionStorage.setItem(FOLLOWING_FEED_CURRENT_VID_KEY, video.id)
    }, [feed, video.id])

    return (
        <Link
            href="/following/feed"
            key={video.id}
            onClick={handleClick}
            className="h-80 aspect-[9/16] md:h-120 relative w-full bg-secondary/40 shadow-md rounded-lg flex flex-col overflow-hidden"
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
