"use client"

import {
    DEFAULT_PROMOTED_VIDEO_BIAS,
    FOLLOWING_FEED_CURRENT_VID_KEY,
    FOLLOWING_FEED_KEY,
} from "@/constants"
import { videoMix } from "@/services/server/mixed-feed"
import { FollowingFeed, VideoWithStats } from "@/types/videos"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import DebugWindow from "../../DebugWindow"
import AppAlert from "../AppAlert"

export default function FollowingCanvas({ promotedVideos }: { promotedVideos: VideoWithStats[] }) {
    const router = useRouter()

    const [feedErr, showFeedErr] = useState(false)
    const [activeVideoId, setActiveVideoId] = useState("")
    const [feed, setFeed] = useState<VideoWithStats[]>([])

    useEffect(() => {
        const followingFeed = sessionStorage.getItem(FOLLOWING_FEED_KEY)
        const currentVideoId = sessionStorage.getItem(FOLLOWING_FEED_CURRENT_VID_KEY)

        if (!followingFeed || !currentVideoId) {
            showFeedErr(true)
            return
        }
        const parsedFollowingFeed = JSON.parse(followingFeed!) as FollowingFeed
        const interleavedVideos = videoMix(
            parsedFollowingFeed.videos,
            promotedVideos,
            DEFAULT_PROMOTED_VIDEO_BIAS,
            parsedFollowingFeed.videos.length,
        )

        setFeed(interleavedVideos)
        setActiveVideoId(currentVideoId)
    }, [promotedVideos])

    const activeVideoIdx = feed.findIndex((v) => v.id === activeVideoId)
    const activeVideo =
        activeVideoIdx && activeVideoIdx >= 0
            ? feed[activeVideoIdx]
            : promotedVideos[activeVideoIdx]

    if (feedErr) {
        return (
            <AppAlert
                type="error"
                isOpen={feedErr}
                title="Sth went wrong"
                description="stuff"
                onAction={() => router.back()}
            />
        )
    }

    return (
        <>
            <DebugWindow>
                <p>All videos: {feed.length}</p>
                <p>PromotedVideos: {promotedVideos.length}</p>
                <p>ActiveVideoId: {activeVideo?.id} </p>
                <p>ActiveVideoIdx: {activeVideoIdx}</p>
            </DebugWindow>

            <h1>Canvas</h1>
        </>
    )
}
