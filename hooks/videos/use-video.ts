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
import { useState } from "react"

export function useVideo() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const { user } = useAuth()

    const getVideoStats = async (videoId: string) => {
        try {
            setLoading(true)
            setError(null)
            const [views, likes, shares, downloads, bookmarks, comments] = await Promise.all([
                getViews(videoId),
                getLikes(videoId),
                getShares(videoId),
                getDownloads(videoId),
                getBookmarks(videoId),
                getComments(videoId),
            ])

            return {
                views: views.length,
                shares: shares.length,
                downloads: downloads.length,
                likes: likes,
                bookmarks: bookmarks,
                comments: comments,
                userLiked: user ? likes.includes(user.uid) : false,
                userBookmarked: user ? bookmarks.includes(user.uid) : false,
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

    const singleVideo = async (videoId: string) => {
        try {
            setLoading(true)
            setError(null)
            return (await getVideo(videoId)) as unknown as Video
        } catch (e) {
            const errorMsg = getError(e) || "Failed to get video"
            setError(errorMsg)
            return null
        } finally {
            setLoading(false)
        }
    }

    // TODO::(253894320916) - handle infinite scroll for both directions
    const getPaginatedVideos = async (lastVideoId: string, userId: string | undefined) => {
        return await getVideos(lastVideoId, userId)
    }
    return {
        loading,
        error,
        singleVideo,
        getVideoStats,
        getPaginatedVideos,
    }
}
