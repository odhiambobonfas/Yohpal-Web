import { getError } from "@/lib/utils"
import { useAuth } from "@/providers/Auth"
import {
    bookmarkVideo,
    commentVideo,
    downloadVideoAction,
    likeVideo,
    shareVideoAction,
    unbookmarkVideo,
    unlikeVideo,
} from "@/services/client/video-mutations"
import { VideoCommentInteraction, VideoInteraction } from "@/types/videos"
import { useState } from "react"

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
            //
            // hasReply false
            // isReply false
            // likes 0
            // msg "very appetizing"
            // profile_picture "https://firebasestorage.googleapis.com/v0/b/yohlab.firebasestorage.app/o/profile_pictures%2F2Kffm6SsC2UAZ5rz1ifboKIh4nj2%2Fprofile_image.jpg?alt=media&token=8ec395e3-aabb-414e-8122-7271e33c6d22"
            // replies 0
            // timestamp September 1, 2025 at 4:08:01 PM UTC+3
            // userId "2Kffm6SsC2UAZ5rz1ifboKIh4nj2"
            // username "kaitli"
            const commentId = await commentVideo(comment)
            return { commentId, comment }
        })
    }

    return { loading, error, toggleLike, toggleBookmark, shareVideo, addComment, downloadVideo }
}
