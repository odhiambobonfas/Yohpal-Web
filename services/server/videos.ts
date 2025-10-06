import { VideoComment, VideoWithStats } from "#/videos"
import { COOKIES, DEFAULT_THUMBNAIL, VIDEO_LIMIT } from "@/constants"
import { db } from "@/lib/firebase/firebase.admin"
import { recoverThumbnail, replaceWithCDN, serializeTimestamp } from "@/lib/utils"

import { withCache } from "@/lib/cache"
import { onlyProd } from "@/lib/dev"
import { cookies } from "next/headers"
import { DOC } from ".."

const videoRef = db.collection("videos")

export const getLandingVideos = async (videoId: string | undefined, userId: string | undefined) => {
    const cookieStore = await cookies()
    const loggedInUserId = cookieStore.get(COOKIES.User)?.value

    return withCache(
        async () => {
            const videos: VideoWithStats[] = []
            let fetchedId: string | undefined

            if (userId) {
                return await getVideosFromProfile(userId, videoId, loggedInUserId)
            }

            if (videoId) {
                const videoDoc = await videoRef.doc(videoId).get()

                if (videoDoc.exists) {
                    const videoData = videoDoc.data()
                    if (!videoData) return
                    delete videoData["campaignMeta"]

                    const videoStats = await onlyProd(
                        () => getVideoStats(videoId, loggedInUserId),
                        { shares: 1, views: 10, bookmarks: [], comments: [], likes: [] },
                    )

                    const cleanVideoData = {
                        id: videoDoc.id,
                        ...videoData,
                        videoUrl: replaceWithCDN(videoData.videoUrl),
                        thumbnail: recoverThumbnail(videoData.thumbnail),
                        timestamp: serializeTimestamp(videoData.timestamp),
                        ...videoStats,
                    } as VideoWithStats
                    fetchedId = cleanVideoData.id

                    videos.push(cleanVideoData)
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
                    if (v.id === fetchedId) return null

                    const videoData = v.data()
                    delete videoData["campaignMeta"]
                    const videoStats = await onlyProd(() => getVideoStats(v.id, loggedInUserId), {
                        shares: 0,
                        views: 10,
                        likes: [],
                        comments: [],
                        bookmarks: [],
                    })

                    return {
                        id: v.id,
                        ...videoData,
                        videoUrl: replaceWithCDN(videoData.videoUrl),
                        thumbnail: replaceWithCDN(videoData.thumbnail) || DEFAULT_THUMBNAIL,
                        timestamp: serializeTimestamp(videoData.timestamp),
                        ...videoStats,
                    }
                }),
            )) as (VideoWithStats | null)[]

            videos.push(...(moreVids.filter(Boolean) as VideoWithStats[]))

            return videos
        },
        `landing-videos-${userId || "anon"}`,
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
            delete videoData["campaignMeta"]

            return {
                id: v.id,
                ...videoData,
                videoUrl: replaceWithCDN(videoData.videoUrl),
                thumbnail: recoverThumbnail(videoData.thumbnail),
                timestamp: serializeTimestamp(videoData.timestamp),
                ...videoStats,
            } as VideoWithStats
        }),
    )
}

export const getUploadedVideoStats = async (videoId: string) => {
    return withCache(async () => {
        const [likes, views] = await Promise.all([getVideoLikes(videoId), getVideoViews(videoId)])

        return {
            likes,
            views,
        }
    }, `uploaded-video-stats-${videoId}`)
}

export const getVideoStats = async (videoId: string, loggedInUserId: string | undefined) => {
    return withCache(async () => {
        const [likes, bookmarks, shares, views, comments] = await Promise.all([
            getVideoLikes(videoId),
            getVideoBookmarks(videoId),
            getVideoShares(videoId),
            getVideoViews(videoId),
            getVideoComments(videoId, loggedInUserId),
        ])

        return {
            likes,
            bookmarks,
            shares,
            views,
            comments,
        }
    }, `video-stats-${videoId}`)
}

export const getUserVideoUploads = async (
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
                    delete videoData["campaignMeta"]

                    const videoStats = await onlyProd(() => getUploadedVideoStats(v.id), {
                        likes: [],
                        views: 10,
                    })

                    return {
                        id: v.id,
                        ...videoData,
                        videoUrl: replaceWithCDN(videoData.videoUrl),
                        thumbnail: recoverThumbnail(videoData.thumbnail),
                        timestamp: serializeTimestamp(videoData.timestamp),
                        ...videoStats,
                    }
                }),
            )

            return videos as unknown as VideoWithStats[]
        },
        `user-video-uploads-${userId}-${limit || "all"}`,
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
    }, `video-likes-${videoId}`)
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
    }, `video-bookmarks-${videoId}`)
}

const getVideoShares = async (videoId: string) => {
    return withCache(async () => {
        const videoRef = await db
            .collection("videos")
            .doc(videoId)
            .collection("shares")
            .doc(DOC)
            .collection("userIds")
            .count()
            .get()

        return videoRef.data().count ?? 0
    }, `video-shares-${videoId}`)
}

const getVideoViews = async (videoId: string) => {
    return withCache(async () => {
        const videoRef = await db
            .collection("videos")
            .doc(videoId)
            .collection("views")
            .doc(DOC)
            .collection("userIds")
            .count()
            .get()

        return videoRef.data().count ?? 0
    }, `video-views-${videoId}`)
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
    }, `video-comments-${videoId}`)
}
