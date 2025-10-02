import { useState } from "react"

import { Video } from "#/videos"
import { getError } from "@/lib/utils"
import { useAuth } from "@/providers/Auth"
import {
    getBookmarks,
    getComments,
    getDownloads,
    getLikes,
    getShares,
    getVideo,
    getVideos,
    getViews,
} from "@/services/client/video"

export default function useVideo(userId: string | undefined) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const { profile } = useAuth()

    const getClientVideoStats = async (videoId: string) => {
        try {
            setLoading(true)
            setError(null)
            const [views, likes, shares, downloads, bookmarks, comments] = await Promise.all([
                getViews(videoId),
                getLikes(videoId),
                getShares(videoId),
                getDownloads(videoId),
                getBookmarks(videoId),
                getComments(videoId, profile?.uid),
            ])

            return {
                views: views.length,
                shares: shares.length,
                downloads: downloads.length,
                likes: likes,
                bookmarks: bookmarks,
                comments: comments,
                userLiked: userId ? likes.includes(userId) : false,
                userBookmarked: userId ? bookmarks.includes(userId) : false,
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
        return await getVideos(lastVideoId, loggedInUserId, userId)
    }
    return {
        loading,
        error,
        singleVideo,
        getClientVideoStats,
        getClientPaginatedVideos,
    }
}
