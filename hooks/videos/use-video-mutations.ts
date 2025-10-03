import { useState } from "react"

import { getError } from "@/lib/utils"
import { useAuth } from "@/providers/Auth"
import {
    addCommentAction,
    deleteCommentAction,
    likeCommentAction,
    unlikeCommentAction,
} from "@/services/client/video-comments-mutations"
import {
    bookmarkVideoAction,
    downloadVideoAction,
    likeVideoAction,
    shareVideoAction,
    unbookmarkVideoAction,
    unlikeVideoAction,
    updateViewAction,
} from "@/services/client/video-mutations"
import { VideoCommentInteraction, VideoInteraction } from "@/types/videos"

export default function useVideoMutation() {
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
                await unlikeVideoAction(interaction)
                return { liked: false }
            } else {
                await likeVideoAction(interaction)
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
                await unbookmarkVideoAction(interaction)
                return { bookmarked: false }
            } else {
                await bookmarkVideoAction(interaction)
                return { bookmarked: true }
            }
        })
    }

    const shareVideo = async (videoId: string) => {
        return mutateWithAuth(async () => {
            await shareVideoAction({ videoId, userId: profile!.uid })
            return { shared: true }
        })
    }

    const downloadVideo = async (videoId: string) => {
        return mutateWithAuth(async () => {
            await downloadVideoAction({ videoId, userId: profile!.uid })
            return { downloaded: true }
        })
    }

    const addView = async (videoId: string, userId: string | undefined) => {
        if (userId) await updateViewAction({ videoId, userId })
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

            const commentId = await addCommentAction(comment)
            return { commentId, comment }
        })
    }

    const deleteComment = async (commentId: string, videoId: string) => {
        return mutateWithAuth(async () => {
            await deleteCommentAction(commentId, videoId)
        })
    }

    const toggleCommentLike = async (
        commentId: string,
        videoId: string,
        currentlyLiked: boolean,
    ) => {
        return mutateWithAuth(async () => {
            if (!currentlyLiked) {
                likeCommentAction({ commentId, userId: profile!.uid, videoId })
            } else {
                unlikeCommentAction({ commentId, userId: profile!.uid, videoId })
            }
        })
    }

    return {
        loading,
        error,
        toggleLike,
        toggleBookmark,
        shareVideo,
        addComment,
        deleteComment,
        toggleCommentLike,
        downloadVideo,
        addView,
    }
}
