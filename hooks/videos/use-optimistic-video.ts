import { useCallback, useEffect, useState } from "react"

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

    useEffect(() => {
        setOptimisticStates((prev) => {
            if (prev.has(activeVideo.id)) return prev
            const base: OptimisticVideoState = {
                likes: {
                    liked: activeVideo.likes.includes(userId ?? ""),
                    count: activeVideo.likes.length,
                },
                bookmarks: {
                    bookmarked: activeVideo.bookmarks.includes(userId ?? ""),
                    count: activeVideo.bookmarks.length,
                },
                shares: activeVideo.shares,
                views: activeVideo.views,
                downloads: activeVideo.downloads,
                comments: activeVideo.comments ?? [],
                following: followings?.includes(activeVideo.userId) ?? false,
            }
            const newMap = new Map(prev)
            newMap.set(activeVideo.id, base)
            return newMap
        })
    }, [activeVideo, userId, followings])

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

        return {
            likes: optimist?.likes?.count ?? activeVideo.likes.length ?? 0,
            bookmarks: optimist?.bookmarks?.count ?? activeVideo.bookmarks.length ?? 0,
            shares: optimist?.shares ?? activeVideo.shares ?? 0,
            views: optimist?.views ?? activeVideo.views ?? 0,
            downloads: optimist?.downloads ?? activeVideo.downloads ?? 0,
            comments: optimist?.comments ?? activeVideo.comments,
            userBookmarked: userBookmarked,
            userLiked: userLiked,
            isFollowing: isFollowing,
        }
    }, [activeVideo, userId, followings, optimisticStates])

    const resetOptimisticStore = () => {
        optimisticStates.clear()
    }

    const updateOptimisticView = useCallback(
        (videoId: string) => {
            const currentViews = optimisticStates.get(videoId)?.views ?? activeVideo.views

            // only update if we haven't seen it
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

    const removeOptimisticComment = useCallback(
        (videoId: string, commentId: string) => {
            const currentComments = optimisticStates.get(videoId)?.comments ?? []
            const filteredComments = currentComments.filter((c) => c.id !== commentId)
            updateOptimisticState(videoId, { comments: filteredComments })
        },
        [optimisticStates, updateOptimisticState],
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
        getCurrentStats,
        resetOptimisticStore,
    }
}
