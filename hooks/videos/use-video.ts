"use client"
import { useState } from "react"

import { Video } from "#/videos"
import { getError, getLast } from "@/lib/utils"
import { useAuth } from "@/providers/Auth"
import { getCVideoStats, getVideo, getVideos } from "@/services/client/video"

export default function useVideo(userId: string | undefined) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const { profile } = useAuth()

    const getClientVideoStats = async (videoId: string) => {
        try {
            setLoading(true)
            setError(null)
            const stats = await getCVideoStats(videoId, profile?.uid)

            return {
                views: stats.views.length,
                shares: stats.shares.length,
                downloads: stats.downloads.length,
                likes: stats.likes,
                bookmarks: stats.bookmarks,
                comments: stats.comments,
                userLiked: userId ? stats.likes.includes(userId) : false,
                userBookmarked: userId ? stats.bookmarks.includes(userId) : false,
            }
        } catch (e) {
            const errorMsg = getError(e)
            setError(errorMsg)

            return {
                views: 0,
                shares: 0,
                downloads: 0,
                likes: [],
                bookmarks: [],
                comments: [],
                userLiked: false,
                userBookmarked: false,
            }
        } finally {
            setLoading(false)
        }
    }

    const singleVideo = async (videoId: string, userId: string | undefined) => {
        try {
            setLoading(true)
            setError(null)
            return (await getVideo(videoId, userId)) as unknown as Video
        } catch (e) {
            const errorMsg = getError(e) || "Failed to get video"
            setError(errorMsg)
            return null
        } finally {
            setLoading(false)
        }
    }

    // TODO(253894320916)
    const getClientPaginatedVideos = async (
        lastVideoId: string,
        loggedInUserId: string | undefined,
    ) => {
        const vods = await getVideos(lastVideoId, loggedInUserId, userId)
        return { videos: vods, lastVideoDocId: getLast(vods)?.id || null }
    }

    return {
        loading,
        error,
        singleVideo,
        getClientVideoStats,
        getClientPaginatedVideos,
        // randomizeVideos,
    }
}
