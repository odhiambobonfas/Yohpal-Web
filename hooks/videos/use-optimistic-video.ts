import { useCallback, useState } from "react"

import { OptimisticVideoState, VideoComment, VideoWithStats } from "#/videos"

export default function useOptimisticVideo(
    activeVideo: VideoWithStats,
    userId: string | undefined,
    followings: string[] | undefined | null,
    watchedVideos: VideoWithStats[] | undefined,
) {
    const [optimisticStates, setOptimisticStates] = useState<Map<string, OptimisticVideoState>>(
        new Map(),
    )

    const updateOptimisticState = useCallback(
        (videoId: string, update: Partial<OptimisticVideoState>) => {
            setOptimisticStates((prev) => {
                const newMap = new Map(prev)
                const current = newMap.get(videoId) || {}
                newMap.set(videoId, { ...current, ...update })
                return newMap
            })
        },
        [],
    )

    const getCurrentStats = useCallback(() => {
        const optimist = optimisticStates.get(activeVideo.id)
        const isFollowing = optimist?.following ?? followings?.includes(activeVideo.userId) ?? false
        const userLiked =
            optimist?.likes?.liked ?? activeVideo.likes.includes(userId || "") ?? false
        const userBookmarked =
            optimist?.bookmarks?.bookmarked ?? activeVideo.bookmarks.includes(userId || "") ?? false

        const optimisticComments = optimist?.comments ?? []
        const realComments = activeVideo.comments ?? []

        // Separate new optimistic comments from updates to real comments
        const newComments: VideoComment[] = []
        const commentUpdates = new Map<string, VideoComment>()

        optimisticComments.forEach((c) => {
            const isRealComment = realComments.some((rc) => rc.id === c.id)
            if (isRealComment) {
                commentUpdates.set(c.id, c)
            } else if (!c.deleted) {
                newComments.push(c)
            }
        })

        // Apply updates to real comments and filter deleted
        const updatedRealComments = realComments
            .map((c) => commentUpdates.get(c.id) ?? c)
            .filter((c) => !c.deleted)

        // New comments first, then real comments (with updates)
        const finalComments = [...newComments, ...updatedRealComments]

        return {
            likes: optimist?.likes?.count ?? activeVideo.likes.length ?? 0,
            bookmarks: optimist?.bookmarks?.count ?? activeVideo.bookmarks.length ?? 0,
            shares: optimist?.shares ?? activeVideo.shares ?? 0,
            views: optimist?.views ?? activeVideo.views ?? 0,
            downloads: optimist?.downloads ?? activeVideo.downloads ?? 0,
            comments: finalComments,
            userBookmarked,
            userLiked,
            isFollowing,
        }
    }, [activeVideo, userId, followings, optimisticStates])

    const resetOptimisticStore = () => {
        optimisticStates.clear()
    }

    const updateOptimisticView = useCallback(
        (videoId: string) => {
            const currentViews = optimisticStates.get(videoId)?.views ?? activeVideo.views

            if (!watchedVideos?.some((v) => v.id === videoId)) {
                updateOptimisticState(videoId, { views: currentViews + 1 })
            }
        },
        [optimisticStates, updateOptimisticState, activeVideo.views, watchedVideos],
    )

    const updateOptimisticLike = useCallback(
        (videoId: string) => {
            const currentStats = getCurrentStats()
            const newLiked = !currentStats.userLiked
            const newCount = newLiked ? currentStats.likes + 1 : currentStats.likes - 1

            updateOptimisticState(videoId, { likes: { liked: newLiked, count: newCount } })
        },
        [getCurrentStats, updateOptimisticState],
    )

    const updateOptimisticBookmark = useCallback(
        (videoId: string) => {
            const currentStats = getCurrentStats()
            const newBookmarked = !currentStats.userBookmarked
            const newCount = newBookmarked ? currentStats.bookmarks + 1 : currentStats.bookmarks - 1

            updateOptimisticState(videoId, {
                bookmarks: { bookmarked: newBookmarked, count: newCount },
            })
        },
        [getCurrentStats, updateOptimisticState],
    )

    const updateOptimisticShare = useCallback(
        (videoId: string) => {
            const currentStats = getCurrentStats()
            updateOptimisticState(videoId, { shares: currentStats.shares + 1 })
        },
        [getCurrentStats, updateOptimisticState],
    )

    const updateOptimisticDownload = useCallback(
        (videoId: string) => {
            const currentStats = getCurrentStats()
            updateOptimisticState(videoId, { downloads: currentStats.downloads + 1 })
        },
        [getCurrentStats, updateOptimisticState],
    )

    const updateOptimisticFollow = useCallback(
        (videoId: string) => {
            const currentStats = getCurrentStats()
            const newFollowing = !currentStats.isFollowing
            updateOptimisticState(videoId, { following: newFollowing })
        },
        [getCurrentStats, updateOptimisticState],
    )

    const updateOptimisticComment = useCallback(
        (videoId: string, comment: VideoComment) => {
            const currentComments = optimisticStates.get(videoId)?.comments ?? []
            updateOptimisticState(videoId, { comments: [comment, ...currentComments] })
        },
        [optimisticStates, updateOptimisticState],
    )

    const replaceOptimisticComment = useCallback(
        (videoId: string, tempId: string, realComment: VideoComment) => {
            const optimist = optimisticStates.get(videoId)
            const currentOptimistic = optimist?.comments ?? []

            const tempIdx = currentOptimistic.findIndex((c) => c.id === tempId)
            if (tempIdx !== -1) {
                const updatedComments = [...currentOptimistic]
                updatedComments[tempIdx] = realComment
                updateOptimisticState(videoId, { comments: updatedComments })
            }
        },
        [optimisticStates, updateOptimisticState],
    )

    const removeOptimisticComment = useCallback(
        (videoId: string, commentId: string) => {
            const optimist = optimisticStates.get(videoId)
            const currentOptimistic = optimist?.comments ?? []

            const optimisticIdx = currentOptimistic.findIndex((c) => c.id === commentId)

            if (optimisticIdx !== -1) {
                const comment = currentOptimistic[optimisticIdx]

                if (comment.id.startsWith("temp-")) {
                    const filtered = currentOptimistic.filter((c) => c.id !== commentId)
                    updateOptimisticState(videoId, { comments: filtered })
                } else {
                    const newComments = [...currentOptimistic]
                    newComments[optimisticIdx] = { ...comment, deleted: true }
                    updateOptimisticState(videoId, { comments: newComments })
                }
            } else {
                const realComment = activeVideo.comments?.find((c) => c.id === commentId)
                if (realComment) {
                    const deletedComment = { ...realComment, deleted: true }
                    updateOptimisticState(videoId, {
                        comments: [deletedComment, ...currentOptimistic],
                    })
                }
            }
        },
        [optimisticStates, activeVideo, updateOptimisticState],
    )

    const updateOptimisticCommentLike = useCallback(
        (commentId: string, videoId: string) => {
            const optimist = optimisticStates.get(videoId)
            const optimisticComments = optimist?.comments ?? []

            const optimisticIdx = optimisticComments.findIndex((c) => c.id === commentId)

            if (optimisticIdx !== -1) {
                const comment = optimisticComments[optimisticIdx]
                const updatedComments = [...optimisticComments]
                updatedComments[optimisticIdx] = {
                    ...comment,
                    userHasLiked: !comment.userHasLiked,
                    likes: comment.userHasLiked ? comment.likes - 1 : comment.likes + 1,
                }
                updateOptimisticState(videoId, { comments: updatedComments })
            } else {
                const realComment = activeVideo.comments?.find((c) => c.id === commentId)
                if (!realComment) return

                const updatedComment = {
                    ...realComment,
                    userHasLiked: !realComment.userHasLiked,
                    likes: realComment.userHasLiked ? realComment.likes - 1 : realComment.likes + 1,
                }

                updateOptimisticState(videoId, {
                    comments: [...optimisticComments, updatedComment],
                })
            }
        },
        [optimisticStates, activeVideo, updateOptimisticState],
    )

    return {
        updateOptimisticView,
        updateOptimisticLike,
        updateOptimisticBookmark,
        updateOptimisticShare,
        updateOptimisticDownload,
        updateOptimisticFollow,
        updateOptimisticComment,
        removeOptimisticComment,
        updateOptimisticCommentLike,
        replaceOptimisticComment,
        getCurrentStats,
        resetOptimisticStore,
    }
}
