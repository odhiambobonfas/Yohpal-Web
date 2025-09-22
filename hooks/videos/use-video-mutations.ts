import { getError } from "@/lib/utils"
import { useAuth } from "@/providers/Auth"
import {
    bookmarkVideo,
    commentVideo,
    deleteCommentAction,
    downloadVideoAction,
    likeVideo,
    shareVideoAction,
    unbookmarkVideo,
    unlikeVideo,
} from "@/services/client/video-mutations"
import { VideoCommentInteraction, VideoInteraction } from "@/types/videos"
import { useState } from "react"

export function useVideoMutation() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const { user, profile } = useAuth()

    const mutateWithAuth = async <T>(
        operation: () => Promise<T>,
        requiresAuth = true,
    ): Promise<T | null> => {
        if (requiresAuth && !user) {
            setError("Authentication required")
            return null
        }

        try {
            setLoading(true)
            setError(null)
            return await operation()
        } catch (e) {
            const errorMsg = getError(e)
            setError(errorMsg)
            return null
        } finally {
            setLoading(false)
        }
    }

    const toggleLike = async (videoId: string, isCurrentlyLiked: boolean) => {
        return mutateWithAuth(async () => {
            const interaction: VideoInteraction = {
                videoId,
                userId: profile!.uid,
            }

            if (isCurrentlyLiked) {
                await unlikeVideo(interaction)
                return { liked: false }
            } else {
                await likeVideo(interaction)
                return { liked: true }
            }
        })
    }
    const toggleBookmark = async (videoId: string, isCurrentlyBookmarked: boolean) => {
        return mutateWithAuth(async () => {
            const interaction: VideoInteraction = {
                videoId,
                userId: profile!.uid,
            }

            if (isCurrentlyBookmarked) {
                await unbookmarkVideo(interaction)
                return { bookmarked: false }
            } else {
                await bookmarkVideo(interaction)
                return { bookmarked: true }
            }
        })
    }

    const shareVideo = async (videoId: string) => {
        return mutateWithAuth(async () => {
            const interaction: VideoInteraction = {
                videoId,
                userId: profile!.uid,
            }
            await shareVideoAction(interaction)
            return { shared: true }
        })
    }

    const downloadVideo = async (videoId: string) => {
        return mutateWithAuth(async () => {
            const interaction: VideoInteraction = {
                videoId,
                userId: profile!.uid,
            }
            await downloadVideoAction(interaction)
            return { downloaded: true }
        })
    }

    const addComment = async (videoId: string, text: string) => {
        return mutateWithAuth(async () => {
            const comment: VideoCommentInteraction = {
                videoId,
                userId: profile!.uid,
                username: profile!.userName,
                profilePicture: profile!.profile_picture,
                comment: text,
                isReply: false,
            }

            const commentId = await commentVideo(comment)
            return { commentId, comment }
        })
    }
    const deleteComment = async (commentId: string, videoId: string) => {
        return mutateWithAuth(async () => {
            await deleteCommentAction(commentId, videoId)
        })
    }

    return {
        loading,
        error,
        toggleLike,
        toggleBookmark,
        deleteComment,
        shareVideo,
        addComment,
        downloadVideo,
    }
}
