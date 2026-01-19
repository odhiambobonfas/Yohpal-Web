"use server"
import { DELETE_IDENT } from "@/constants"
import { withCache } from "@/lib/cache"
import { logger } from "@/lib/logger"
import { redis } from "@/lib/redis"
import { getError } from "@/lib/utils"
import { VideoInteraction } from "@/types/videos"

async function toggleCachedVideoLikeAction(interaction: VideoInteraction) {
    const key = `likes:${interaction.videoId}`
    let parsedVideoLikes: string[] = []

    try {
        const videoLikes = redis ? await redis.get(key) : null
        if (videoLikes) parsedVideoLikes = JSON.parse(videoLikes)

        const userIndex = parsedVideoLikes.findIndex((u) => u.startsWith(interaction.userId))

        if (userIndex === -1) {
            parsedVideoLikes.push(interaction.userId)
        } else if (parsedVideoLikes[userIndex].endsWith(DELETE_IDENT)) {
            parsedVideoLikes[userIndex] = interaction.userId
        } else {
            parsedVideoLikes[userIndex] = `${interaction.userId}:${DELETE_IDENT}`
        }

        withCache(() => Promise.resolve(JSON.stringify(parsedVideoLikes)), key)
        await updateCachedVideosLookup(interaction.videoId)
    } catch (e) {
        logger.error(`[LIKE CACHE UPDATE ERR]:${getError(e)}`)
    }
}

async function toggleBookmarkCachedVideoAction(interaction: VideoInteraction) {
    const key = `bookmarks:${interaction.videoId}`
    let parsedVideoBookmarks: string[] = []

    try {
        const videoBookmarks = redis ? await redis.get(key) : null
        if (videoBookmarks) parsedVideoBookmarks = JSON.parse(videoBookmarks)

        const userIndex = parsedVideoBookmarks.findIndex((u) => u.startsWith(interaction.userId))

        if (userIndex === -1) {
            parsedVideoBookmarks.push(interaction.userId)
        } else if (parsedVideoBookmarks[userIndex].endsWith(DELETE_IDENT)) {
            parsedVideoBookmarks[userIndex] = interaction.userId
        } else {
            parsedVideoBookmarks[userIndex] = `${interaction.userId}:${DELETE_IDENT}`
        }

        withCache(() => Promise.resolve(JSON.stringify(parsedVideoBookmarks)), key)
        await updateCachedVideosLookup(interaction.videoId)
    } catch (e) {
        logger.error(`[BOOKMARK CACHE UPDATE ERR]:${getError(e)}`)
    }
}

async function downloadCachedVideoAction(interaction: VideoInteraction) {
    const key = `downloads:${interaction.videoId}`
    let parsedVideoDownloads: string[] = []

    try {
        const videoDownloads = redis ? await redis.get(key) : null
        if (videoDownloads) parsedVideoDownloads = JSON.parse(videoDownloads)

        if (parsedVideoDownloads.includes(interaction.userId)) return

        parsedVideoDownloads.push(interaction.userId)

        withCache(() => Promise.resolve(JSON.stringify(parsedVideoDownloads)), key)
        await updateCachedVideosLookup(interaction.videoId)
    } catch (e) {
        logger.error(`[DOWNLOADS CACHE UPDATE ERR]:${getError(e)}`)
    }
}

async function viewCachedVideoAction(interaction: VideoInteraction) {
    const key = `views:${interaction.videoId}`
    let parsedVideoViews: string[] = []

    try {
        const videoViews = redis ? await redis.get(key) : null
        if (videoViews) parsedVideoViews = JSON.parse(videoViews)

        if (parsedVideoViews.includes(interaction.userId)) return

        parsedVideoViews.push(interaction.userId)

        withCache(() => Promise.resolve(JSON.stringify(parsedVideoViews)), key)
        await updateCachedVideosLookup(interaction.videoId)
    } catch (e) {
        logger.error(`[VIEWS CACHE UPDATE ERR]:${getError(e)}`)
    }
}

async function shareCachedVideoAction(interaction: VideoInteraction) {
    const key = `shares:${interaction.videoId}`
    let parsedVideoShared: string[] = []

    try {
        const videoShared = redis ? await redis.get(key) : null
        if (videoShared) parsedVideoShared = JSON.parse(videoShared)

        if (parsedVideoShared.includes(interaction.userId)) return

        parsedVideoShared.push(interaction.userId)

        withCache(() => Promise.resolve(JSON.stringify(parsedVideoShared)), key)
        await updateCachedVideosLookup(interaction.videoId)
    } catch (e) {
        logger.error(`[SHARES CACHE UPDATE ERR]:${getError(e)}`)
    }
}

async function updateCachedVideosLookup(videoId: string) {
    if (!redis) return

    let parsedLookup: string[] = []
    try {
        const lookup = await redis.get("videos:lookup")

        if (lookup) parsedLookup = JSON.parse(lookup)

        if (!parsedLookup.includes(videoId)) {
            parsedLookup.push(videoId)

            await redis.set("videos:lookup", JSON.stringify(parsedLookup))
        }
    } catch (e) {
        logger.error(`[LOOKUP ERR]: ${getError(e)}`)
    }
}

export {
    downloadCachedVideoAction,
    shareCachedVideoAction,
    toggleBookmarkCachedVideoAction,
    toggleCachedVideoLikeAction,
    updateCachedVideosLookup,
    viewCachedVideoAction,
}
