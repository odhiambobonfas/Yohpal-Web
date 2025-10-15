import { VideoComment, VideoWithStats } from "#/videos"
import { useUserMutation } from "@/hooks/user/use-user-mutation"
import useVideoMutation from "@/hooks/videos/use-video-mutations"
import { logger } from "@/lib/logger"
import { useAuth } from "@/providers/Auth"
import { useState } from "react"
import useOptimisticVideo from "./use-optimistic-video"

export default function useVideoHandlers({
    activeVideo,
    followingData,
    watchedVideos,
}: {
    activeVideo: VideoWithStats
    followingData: string[] | null | undefined
    watchedVideos: VideoWithStats[] | undefined
}) {
    const { isAuthenticated, profile } = useAuth()
    const [commentTexts, setCommentTexts] = useState<Map<string, string>>(new Map())
    const [showAuthDialog, setShowAuthDialog] = useState(false)

    const {
        updateOptimisticView,
        updateOptimisticLike,
        updateOptimisticBookmark,
        updateOptimisticShare,
        updateOptimisticDownload,
        updateOptimisticFollow,
        updateOptimisticComment,
        removeOptimisticComment,
        updateOptimisticCommentLike,
        resetOptimisticStore,
        getCurrentStats,
    } = useOptimisticVideo(activeVideo, profile?.uid, followingData, watchedVideos)

    const {
        loading: mutationLoading,
        error: mutationError,
        toggleLike,
        toggleBookmark,
        addComment,
        addView,
        shareVideo,
        downloadVideo,
        deleteComment,
        toggleCommentLike,
    } = useVideoMutation()

    const {
        loading: userMutationLoading,
        error: userMutationError,
        toggleFollow,
    } = useUserMutation()

    const openAuthDialog = () => setShowAuthDialog(true)
    const closeAuthDialog = () => setShowAuthDialog(false)

    const handleView = async () => {
        if (isAuthenticated) {
            updateOptimisticView(activeVideo.id)
            await addView(activeVideo.id, profile?.uid)
        }
    }

    const handleFollowToggle = async (userId: string) => {
        if (!isAuthenticated) {
            openAuthDialog()
            return
        }

        const currentStats = getCurrentStats()
        updateOptimisticFollow(userId)
        await toggleFollow(userId, currentStats.isFollowing)
    }

    const handleLikeToggle = async () => {
        if (!isAuthenticated) {
            openAuthDialog()
            return
        }

        const currentStats = getCurrentStats()
        updateOptimisticLike(activeVideo.id)
        await toggleLike(activeVideo.id, currentStats.userLiked)
    }

    const handleBookmark = async () => {
        if (!isAuthenticated) {
            openAuthDialog()
            return
        }

        const currentStats = getCurrentStats()
        updateOptimisticBookmark(activeVideo.id)
        await toggleBookmark(activeVideo.id, currentStats.userBookmarked)
    }

    const handleShare = async () => {
        if (!isAuthenticated) {
            openAuthDialog()
            return
        }

        updateOptimisticShare(activeVideo.id)
        await shareVideo(activeVideo.id)
    }

    const handleDownload = async () => {
        const videoId = activeVideo.id
        if (isAuthenticated) updateOptimisticDownload(activeVideo.id)

        const link = document.createElement("a")
        link.href = `/api/proxy/${videoId}`
        link.download = ""
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        await downloadVideo(videoId)
    }

    const handleComment = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!isAuthenticated) {
            openAuthDialog()
            return
        }

        const videoId = activeVideo.id

        const text = commentTexts.get(videoId)?.trim()
        if (!text) return

        // Clear comment text for this video
        setCommentTexts((prev) => {
            const newMap = new Map(prev)
            newMap.set(videoId, "")
            return newMap
        })

        const tempId = `temp-${Date.now()}`
        const tempComment = {
            id: tempId,
            msg: text,
            username: profile?.userName,
            userId: profile?.uid,
            profile_picture: profile?.profile_picture,
            isReply: false,
            likes: 0,
            replies: 0,
            userHasLiked: false,
            videoId: activeVideo.id,
            deleted: false,
        } as unknown as VideoComment

        // TODO(55d45572bb3d)
        updateOptimisticComment(videoId, tempComment) // update ui first
        const res = await addComment(tempId, videoId, text)

        if (!res) {
            logger.error("Failed to add comment:", mutationError)
            // Restore text on error
            setCommentTexts((prev) => {
                const newMap = new Map(prev)
                newMap.set(videoId, text)
                return newMap
            })
            return
        }
    }

    const handleCommentTextChange = (videoId: string, text: string) => {
        setCommentTexts((prev) => {
            const newMap = new Map(prev)
            newMap.set(videoId, text)
            return newMap
        })
    }

    const handleCommentLikeToggle = (commentId: string, videoId: string, wasLiked: boolean) => {
        if (!isAuthenticated) {
            openAuthDialog()
            return
        }

        updateOptimisticCommentLike(commentId, videoId)
        toggleCommentLike(commentId, videoId, wasLiked)
    }

    const handleCommentDelete = (commentId: string, videoId: string) => {
        if (!isAuthenticated) {
            openAuthDialog()
            return
        }

        removeOptimisticComment(videoId, commentId)
        deleteComment(commentId, videoId)
    }

    const handleStoreReset = () => {
        resetOptimisticStore()
    }
    const handleGetCurrentStats = () => getCurrentStats()

    return {
        // Handlers
        handleFollowToggle,
        handleLikeToggle,
        handleBookmark,
        handleView,
        handleShare,
        handleDownload,
        handleComment,
        handleCommentTextChange,
        handleCommentLikeToggle,
        handleCommentDelete,

        handleStoreReset,
        handleGetCurrentStats,

        // State
        commentTexts,

        showAuthDialog,
        openAuthDialog,
        closeAuthDialog,

        // Loading/error states
        isLoading: userMutationLoading || mutationLoading,
        error: mutationError || userMutationError,
    }
}
