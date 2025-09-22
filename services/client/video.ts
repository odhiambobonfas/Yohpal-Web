import { db } from "@/lib/firebase/firebase.browser"
import { Video, VideoComment, VideoWithStats } from "#/videos"
import {
    and,
    collection,
    doc,
    documentId,
    getDoc,
    getDocs,
    limit,
    orderBy,
    query,
    startAfter,
    startAt,
    where,
} from "firebase/firestore"
import { DOC } from "@/services"
import { recoverThumbnail, replaceWithCDN, serializeTimestamp } from "@/lib/utils"
import { VIDEO_LIMIT } from "@/constants"

const videosRef = collection(db, "videos")

export async function getVideos(lastVideoId: string, userId: string | undefined) {
    const lastVideoRef = await getDoc(doc(videosRef, lastVideoId))
    if (userId) {
        return await getVideosFromProfile(userId, lastVideoId)
    }

    const videoDocsQuery = query(
        videosRef,
        orderBy("timestamp", "desc"),
        orderBy(documentId(), "desc"),
        startAfter(lastVideoRef),
        where("broken", "==", false),
        where("privacy", "==", "Everyone"),
        limit(VIDEO_LIMIT),
    )

    const videoDocs = await getDocs(videoDocsQuery)

    const videos = await Promise.all(
        videoDocs.docs.map(async (v) => {
            const videoData = v.data()
            const videoStats = await getVideoStats(v.id)
            return {
                id: v.id,
                ...videoData,
                thumbnail: recoverThumbnail(videoData.thumbnail),
                videoUrl: replaceWithCDN(videoData.videoUrl),
                timestamp: serializeTimestamp(videoData.timestamp),
                ...videoStats,
            }
        }),
    )

    return videos as unknown as VideoWithStats[]
}

async function getVideosFromProfile(userId: string, videoId: string | undefined) {
    let videoQuery = query(
        videosRef,
        where("userId", "==", userId),
        where("broken", "==", false),
        where("privacy", "==", "Everyone"),
        orderBy("timestamp", "desc"),
        limit(VIDEO_LIMIT),
    )

    if (videoId) {
        const videoDoc = await getDoc(doc(videosRef, videoId))
        if (videoDoc.exists()) {
            const videoData = videoDoc.data()
            videoQuery = query(
                videosRef,
                where("userId", "==", userId),
                where("broken", "==", false),
                where("privacy", "==", "Everyone"),
                orderBy("timestamp", "desc"),
                startAt(videoData.timestamp),
                limit(VIDEO_LIMIT),
            )
        }
    }

    const videoDocs = await getDocs(videoQuery)
    if (videoDocs.empty) return []

    return await Promise.all(
        videoDocs.docs.map(async (v) => {
            const videoStats = await getVideoStats(v.id)
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

async function getVideoStats(videoId: string) {
    const [views, likes, bookmarks, shares, downloads, comments] = await Promise.all([
        getViews(videoId),
        getLikes(videoId),
        getBookmarks(videoId),
        getShares(videoId),
        getDownloads(videoId),
        getComments(videoId),
    ])

    return {
        views: views.length,
        shares: shares.length,
        downloads: downloads.length,
        likes,
        bookmarks,
        comments,
    }
}

export async function getViews(videoId: string) {
    const videoDocRef = collection(db, "videos", videoId, "views", DOC, "userIds")
    const videoStatsDocs = await getDocs(videoDocRef)
    if (videoStatsDocs.empty) return []
    return videoStatsDocs.docs.map((d) => d.id)
}

export async function getLikes(videoId: string) {
    const videoDocRef = collection(db, "videos", videoId, "likes", DOC, "userIds")
    const videoLikesDocs = await getDocs(videoDocRef)

    if (videoLikesDocs.empty) return []
    return videoLikesDocs.docs.map((d) => d.id)
}

export async function getShares(videoId: string) {
    const videoDocRef = collection(db, "videos", videoId, "shares", DOC, "userIds")
    const videoStatsDocs = await getDocs(videoDocRef)
    if (videoStatsDocs.empty) return []
    return videoStatsDocs.docs.map((d) => d.id)
}

export async function getBookmarks(videoId: string) {
    const videoDocRef = collection(db, "videos", videoId, "bookmarks", DOC, "userIds")
    const videoStatsDocs = await getDocs(videoDocRef)
    if (videoStatsDocs.empty) return []
    return videoStatsDocs.docs.map((d) => d.id)
}

export async function getDownloads(videoId: string) {
    const videoDocRef = collection(db, "videos", videoId, "downloads", DOC, "userIds")
    const videoStatsDocs = await getDocs(videoDocRef)
    if (videoStatsDocs.empty) return []
    return videoStatsDocs.docs.map((d) => d.id)
}

export async function getVideo(videoId: string) {
    const videoDocRef = doc(db, "videos", videoId)
    const videoDoc = await getDoc(videoDocRef)
    if (!videoDoc.exists()) return null
    return { id: videoDoc.id, ...videoDoc.data() } as unknown as Video
}

export async function getComments(videoId: string) {
    const videoCommentsRef = collection(db, "comments", videoId, "messages")
    const videoCommentsQuery = query(videoCommentsRef, orderBy("timestamp", "desc"))

    const videoCommentsDocs = await getDocs(videoCommentsQuery)
    if (videoCommentsDocs.empty) return []

    return videoCommentsDocs.docs.map((c) => ({
        id: c.id,
        ...c.data(),
    })) as unknown as VideoComment[]
}

export async function getUserUploadedVideos(userId: string) {
    const q = query(
        collection(db, "videos"),
        and(where("userId", "==", userId), where("broken", "==", false)),
        orderBy("timestamp", "desc"),
    )
    const videoDocsRef = await getDocs(q)
    return videoDocsRef.docs.map((v) => ({ id: v.id, ...v.data() })) as unknown as Video[]
}

export async function getMultiVideosData(videoIds: string[]) {
    const videos = await Promise.all(
        videoIds.map(async (v) => {
            return getVideo(v)
        }),
    )
    return videos.filter((v) => v !== null)
}
