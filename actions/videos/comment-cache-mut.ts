"use server"

import { withCache } from "@/lib/cache"
import { logger } from "@/lib/logger"
import { redis } from "@/lib/redis"
import { getError } from "@/lib/utils"
import { VideoComment, VideoCommentInteraction } from "@/types/videos"
import { updateCachedVideosLookup } from "./video-stats-cache-mut"

interface CommentActionProps {
    videoId: string
    userId: string
    commentId: string
}

async function addCommentCacheAction(interaction: VideoCommentInteraction) {
    const key = `comments:${interaction.videoId}`

    let cachedComments: VideoComment[] = []

    try {
        const comments = await redis.get(key)
        if (comments) cachedComments = JSON.parse(comments)

        const now = new Date()

        const tempComment: VideoComment = {
            id: interaction.tempId,
            replies: 0,
            msg: interaction.comment,
            userId: interaction.userId,
            hasReply: false,
            isReply: false,
            username: interaction.username,
            profile_picture: interaction.profilePicture,
            likes: 0,
            timestamp: {
                seconds: Math.floor(now.getTime() / 1000),
                nanoseconds: (now.getTime() % 1000) * 1000000,
            },
            videoId: interaction.videoId,
            userHasLiked: false,
            deleted: false,
        }

        cachedComments.push(tempComment)
        withCache(() => Promise.resolve(JSON.stringify(cachedComments)), key)
        updateCachedVideosLookup(interaction.videoId)
        return tempComment
    } catch (e) {
        logger.error(`[COMMENT CACHE ADD ERR]: ${getError(e)}`)
    }
}

async function deleteCacheComment(commentId: string, videoId: string) {
    const key = `comments:${videoId}`

    let parsedComments: VideoComment[] = []

    try {
        const comments = await redis.get(key)
        if (comments) parsedComments = JSON.parse(comments)

        const commentIdx = parsedComments.findIndex((c) => c.id === commentId)
        if (commentIdx === -1) return //we couldnt find the comment

        parsedComments[commentIdx].deleted = true
        withCache(() => Promise.resolve(JSON.stringify(parsedComments)), key)
        updateCachedVideosLookup(videoId)
    } catch (e) {
        logger.error(`[COMMENT CACHE DELETE ERR]: ${getError(e)}`)
    }
}

async function toggleCacheCommentLike(cap: CommentActionProps, like: boolean) {
    const key = `comments:${cap.videoId}`

    let parsedComments: VideoComment[] = []

    try {
        const comments = await redis.get(key)
        if (comments) parsedComments = JSON.parse(comments)

        const commentIdx = parsedComments.findIndex((c) => c.id === cap.commentId)
        if (commentIdx === -1) return //we couldn't find the comment

        let oldLikes = parsedComments[commentIdx].likes

        parsedComments[commentIdx].likes = like ? (oldLikes += 1) : Math.max(0, oldLikes - 1)

        withCache(() => Promise.resolve(JSON.stringify(parsedComments)), key)
        updateCachedVideosLookup(cap.videoId)
    } catch (e) {
        logger.error(`[COMMENT CACHE LIKE TOGGLE ERR]: ${getError(e)}`)
    }
}

export { addCommentCacheAction, deleteCacheComment, toggleCacheCommentLike }
