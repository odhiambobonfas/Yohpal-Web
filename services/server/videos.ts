"use server"
import { VideoComment, VideoWithStats } from "#/videos"
import { DEFAULT_THUMBNAIL, VIDEO_LIMIT } from "@/constants"
import { db } from "@/lib/firebase/firebase.admin"
import {
    flattenObject,
    getLast,
    recoverThumbnail,
    replaceWithCDN,
    serializeTimestamp,
} from "@/lib/utils"

import { withCache } from "@/lib/cache"
import { onlyProd } from "@/lib/dev"
import { DOC } from ".."

const videoRef = db.collection("videos")

type ColName = "downloads" | "views" | "likes" | "bookmarks" | "watched"

const getLandingVideos = async (
    videoId: string | undefined,
    userId: string | undefined,
    loggedInUserId: string | undefined,
) => {
    return withCache(
        async () => {
            let firstVideo: VideoWithStats | null = null

            if (userId) {
                const vods = await getVideosFromProfile(userId, videoId, loggedInUserId)
                return { videos: vods, lastVideoDoc: getLast(vods)!.id, firstVideo: null }
            }

            if (videoId) {
                const videoDoc = await videoRef.doc(videoId).get()

                if (videoDoc.exists) {
                    const videoData = videoDoc.data()
                    if (!videoData) return

                    const videoStats = await onlyProd(
                        () => getVideoStats(videoId, loggedInUserId),
                        {
                            shares: [],
                            views: [],
                            bookmarks: [],
                            comments: [],
                            likes: [],
                            downloads: [],
                        },
                    )

                    firstVideo = flattenObject({
                        id: videoDoc.id,
                        ...videoData,
                        videoUrl: replaceWithCDN(videoData.videoUrl),
                        thumbnail: recoverThumbnail(videoData.thumbnail),
                        timestamp: serializeTimestamp(videoData.timestamp),
                        ...videoStats,
                    }) as VideoWithStats
                }
            }

            const videosDocs = await videoRef
                .where("broken", "==", false)
                .where("privacy", "in", ["Everyone"])
                .orderBy("timestamp", "desc")
                .limit(VIDEO_LIMIT)
                .get()

            const moreVids = (await Promise.all(
                videosDocs.docs.map(async (v) => {
                    if (v.id === firstVideo?.id) return null

                    const videoData = v.data()
                    delete videoData["campaignMeta"]
                    const videoStats = await onlyProd(() => getVideoStats(v.id, loggedInUserId), {
                        shares: [],
                        views: [],
                        likes: [],
                        comments: [],
                        bookmarks: [],
                        downloads: [],
                    })

                    return flattenObject({
                        id: v.id,
                        ...videoData,
                        videoUrl: replaceWithCDN(videoData.videoUrl),
                        thumbnail: replaceWithCDN(videoData.thumbnail) || DEFAULT_THUMBNAIL,
                        timestamp: serializeTimestamp(videoData.timestamp),
                        ...videoStats,
                    })
                }),
            )) as (VideoWithStats | null)[]

            const finalVideos = [firstVideo, ...moreVids].filter((v) => v !== null)
            const lastDoc = getLast(finalVideos)!.id

            return {
                videos: finalVideos,
                lastVideoDoc: lastDoc,
                firstVideo: firstVideo?.id || null,
            }
        },
        `landing:videos-:${userId || "anon"}:${videoId || ""}`,
    )
}

async function getVideosFromProfile(
    userId: string,
    videoId: string | undefined,
    loggedInUserId: string | undefined,
) {
    let query = videoRef
        .where("userId", "==", userId)
        .where("broken", "==", false)
        .where("privacy", "==", "Everyone")
        .orderBy("timestamp", "desc")

    if (videoId) {
        const videoDoc = await videoRef.doc(videoId).get()
        if (videoDoc.exists) {
            const videoData = videoDoc.data()
            query = query.startAt(videoData!.timestamp)
        }
    }

    const videoDocs = await query.limit(VIDEO_LIMIT).get()
    if (videoDocs.empty) return []

    return await Promise.all(
        videoDocs.docs.map(async (v) => {
            const videoStats = await getVideoStats(v.id, loggedInUserId)
            const videoData = v.data()

            return flattenObject({
                id: v.id,
                ...videoData,
                videoUrl: replaceWithCDN(videoData.videoUrl),
                thumbnail: recoverThumbnail(videoData.thumbnail),
                timestamp: serializeTimestamp(videoData.timestamp),
                ...videoStats,
            }) as VideoWithStats
        }),
    )
}

const getUploadedVideoStats = async (videoId: string) => {
    const [likes, views] = await Promise.all([getVideoLikes(videoId), getVideoViews(videoId)])

    return {
        likes,
        views,
    }
}

const getVideoStats = async (videoId: string, loggedInUserId: string | undefined) => {
    const [likes, bookmarks, shares, views, comments, downloads] = await Promise.all([
        getVideoLikes(videoId),
        getVideoBookmarks(videoId),
        getVideoShares(videoId),
        getVideoViews(videoId),
        getVideoComments(videoId, loggedInUserId),
        getVideoDownloads(videoId),
    ])

    return {
        likes,
        bookmarks,
        shares,
        views,
        comments,
        downloads,
    }
}

const getUserVideoUploads = async (
    userId: string,
    loggedInUserId: string | undefined,
    limit: number | undefined,
) => {
    return withCache(
        async () => {
            let query = db
                .collection("videos")
                .where("userId", "==", userId)
                .where("broken", "==", false)
                .where("privacy", "in", ["Everyone"])
                .orderBy("timestamp", "desc")

            if (limit) query = query.limit(limit)

            const videoUploads = await query.get()

            if (videoUploads.empty) return []

            const videos = await Promise.all(
                videoUploads.docs.map(async (v) => {
                    const videoData = v.data()

                    const videoStats = await onlyProd(() => getUploadedVideoStats(v.id), {
                        likes: [],
                        views: [],
                    })

                    return flattenObject({
                        id: v.id,
                        ...videoData,
                        videoUrl: replaceWithCDN(videoData.videoUrl),
                        thumbnail: recoverThumbnail(videoData.thumbnail),
                        timestamp: serializeTimestamp(videoData.timestamp),
                        ...videoStats,
                    })
                }),
            )

            return videos as unknown as VideoWithStats[]
        },
        `user:video:uploads:${userId}:${limit || "all"}`,
    )
}

const getVideoLikes = async (videoId: string) => {
    return withCache(async () => {
        const videoRef = await db
            .collection("videos")
            .doc(videoId)
            .collection("likes")
            .doc(DOC)
            .collection("userIds")
            .get()

        if (videoRef.empty) return []

        return videoRef.docs.map((v) => v.id)
    }, `likes:${videoId}`)
}

const getVideoDownloads = async (videoId: string) => {
    return withCache(async () => {
        const videoRef = await db
            .collection("videos")
            .doc(videoId)
            .collection("downloads")
            .doc(DOC)
            .collection("userIds")
            .get()

        if (videoRef.empty) return []

        return videoRef.docs.map((v) => v.id)
    }, `downloads:${videoId}`)
}

const getVideoBookmarks = async (videoId: string) => {
    return withCache(async () => {
        const videoRef = await db
            .collection("videos")
            .doc(videoId)
            .collection("bookmarks")
            .doc(DOC)
            .collection("userIds")
            .get()

        if (videoRef.empty) return []

        return videoRef.docs.map((v) => v.id)
    }, `bookmarks:${videoId}`)
}

const getVideoShares = async (videoId: string) => {
    return withCache(async () => {
        const videoRef = await db
            .collection("videos")
            .doc(videoId)
            .collection("shares")
            .doc(DOC)
            .collection("userIds")
            .get()

        if (videoRef.empty) return []

        return videoRef.docs.map((d) => d.id)
    }, `shares:${videoId}`)
}

const getVideoViews = async (videoId: string) => {
    return withCache(async () => {
        const videoRef = await db
            .collection("videos")
            .doc(videoId)
            .collection("views")
            .doc(DOC)
            .collection("userIds")
            .get()

        if (videoRef.empty) return []

        return videoRef.docs.map((d) => d.id)
    }, `views:${videoId}`)
}

const getVideoComments = async (videoId: string, userId: string | undefined) => {
    return withCache(async () => {
        const commentsRef = db.collection("comments").doc(videoId).collection("messages")

        const commentsRefDoc = await commentsRef.get()

        if (commentsRefDoc.empty) return []
        const comments = await Promise.all(
            commentsRefDoc.docs.map(async (c) => {
                let userLiked = false
                if (userId) {
                    userLiked = (
                        await commentsRef.doc(c.id).collection("userIds").doc(userId).get()
                    ).exists
                }
                const data = c.data()
                return {
                    id: c.id,
                    ...data,
                    profile_picture: replaceWithCDN(data.profile_picture),
                    timestamp: serializeTimestamp(data.timestamp),
                    userHasLiked: userLiked,
                    videoId: videoId,
                }
            }),
        )

        return comments as unknown as VideoComment[]
    }, `comments:${videoId}`)
}

const getUserProfileVideos = async (userId: string) => {
    const [uploaded, liked, bookmarks, watched] = await Promise.all([
        getUserVideoUploads(userId, undefined, undefined),
        getUserLikedVideos(userId),
        getUserBookmarkedVideos(userId),
        getUserWatchedVideos(userId),
    ])
    return {
        uploadedVideo: uploaded,
        likedVideos: liked,
        bookmarkedVideos: bookmarks,
        watchedVideos: watched,
    }
}

const getUserLikedVideos = async (userId: string) => await getUserVideoGeneral(userId, "likes")
const getUserBookmarkedVideos = async (userId: string) => {
    return await getUserVideoGeneral(userId, "bookmarks")
}
const getUserWatchedVideos = async (userId: string) => {
    return await getUserVideoGeneral(userId, "watched")
}

const getUserVideoGeneral = async (userId: string, colName: ColName) => {
    const userVideoDocs = await db
        .collection("users")
        .doc(userId)
        .collection(colName)
        .doc(DOC)
        .collection("videoIds")
        .get()

    const videos = await Promise.all(userVideoDocs.docs.map(async (v) => await getVideo(v.id)))
    return videos.filter((v) => v !== null)
}

const getVideo = async (videoId: string) => {
    const getOp = async () => {
        const videoDoc = await db.collection("videos").doc(videoId).get()
        if (!videoDoc.exists) return null

        const videoData = videoDoc.data()

        return flattenObject({
            id: videoDoc.id,
            ...videoData,
            videoUrl: replaceWithCDN(videoData!.videoUrl),
            thumbnail: recoverThumbnail(videoData!.thumbnail),
            timestamp: serializeTimestamp(videoData!.timestamp),
        }) as VideoWithStats
    }

    return await withCache(getOp, `video:${videoId}`)
}

export { getLandingVideos, getUserProfileVideos, getUserVideoUploads, getVideoStats }
