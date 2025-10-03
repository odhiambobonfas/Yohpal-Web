import { VideoComment, VideoWithStats } from "#/videos"
import { COOKIES, DEFAULT_THUMBNAIL, VIDEO_LIMIT } from "@/constants"
import { db } from "@/lib/firebase/firebase.admin"
import { recoverThumbnail, replaceWithCDN, serializeTimestamp } from "@/lib/utils"

import { cookies } from "next/headers"
import { DOC } from ".."

const videoRef = db.collection("videos")

export async function getLandingVideos(videoId: string | undefined, userId: string | undefined) {
    const cookieStore = await cookies()
    const loggedInUserId = cookieStore.get(COOKIES.User)?.value

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

            const videoStats = await getVideoStats(videoId, loggedInUserId)

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
        // TODO(f0bfff672065)
        .where("privacy", "in", ["Everyone"])
        .orderBy("timestamp", "desc")
        .limit(VIDEO_LIMIT)
        .get()

    const moreVids = (await Promise.all(
        videosDocs.docs.map(async (v) => {
            if (v.id === fetchedId) return null

            const videoData = v.data()
            // TODO(583fae8a3d42)
            delete videoData["campaignMeta"]

            const videoStats = await getVideoStats(v.id, loggedInUserId)
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

async function getVideoStats(videoId: string, loggedInUserId: string | undefined) {
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
}

export async function getUserVideoUploads(userId: string, loggedInUserId: string | undefined) {
    const videoUploads = await db
        .collection("videos")
        .where("userId", "==", userId)
        .where("broken", "==", false)
        // TODO(f0bfff672065)
        .where("privacy", "in", ["Everyone"])
        .orderBy("timestamp", "desc")
        .get()

    if (videoUploads.empty) return []

    const videos = await Promise.all(
        videoUploads.docs.map(async (v) => {
            const videoData = v.data()
            delete videoData["campaignMeta"]

            const videoStats = await getVideoStats(v.id, loggedInUserId)

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
}

async function getVideoLikes(videoId: string) {
    const videoRef = await db
        .collection("videos")
        .doc(videoId)
        .collection("likes")
        .doc(DOC)
        .collection("userIds")
        .get()

    if (videoRef.empty) return []

    return videoRef.docs.map((v) => v.id)
}

async function getVideoBookmarks(videoId: string) {
    const videoRef = await db
        .collection("videos")
        .doc(videoId)
        .collection("bookmarks")
        .doc(DOC)
        .collection("userIds")
        .get()

    if (videoRef.empty) return []

    return videoRef.docs.map((v) => v.id)
}

async function getVideoShares(videoId: string) {
    const videoRef = await db
        .collection("videos")
        .doc(videoId)
        .collection("shares")
        .doc(DOC)
        .collection("userIds")
        .count()
        .get()

    return videoRef.data().count ?? 0
}

async function getVideoViews(videoId: string) {
    const videoRef = await db
        .collection("videos")
        .doc(videoId)
        .collection("views")
        .doc(DOC)
        .collection("userIds")
        .count()
        .get()

    return videoRef.data().count ?? 0
}

async function getVideoComments(videoId: string, userId: string | undefined) {
    const commentsRef = db.collection("comments").doc(videoId).collection("messages")

    const commentsRefDoc = await commentsRef.get()

    if (commentsRefDoc.empty) return []
    const comments = await Promise.all(
        commentsRefDoc.docs.map(async (c) => {
            let userLiked = false
            if (userId) {
                userLiked = (await commentsRef.doc(c.id).collection("userIds").doc(userId).get())
                    .exists
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
}
