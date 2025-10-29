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

import { VideoWithStats } from "#/videos"
import { VIDEO_LIMIT } from "@/constants"
import { onlyProd } from "@/lib/dev"
import { db } from "@/lib/firebase/firebase.browser"
import { flattenObject, recoverThumbnail, replaceWithCDN, serializeTimestamp } from "@/lib/utils"
import { DOC } from "@/services"
import { getVideoStats } from "../server/videos"

const videosRef = collection(db, "videos")

export async function getVideos(
    lastVideoId: string,
    loggedInUserId: string | undefined,
    userId: string | undefined,
) {
    const lastVideoRef = await getDoc(doc(videosRef, lastVideoId))
    if (userId) {
        return await getVideosFromProfile(userId, loggedInUserId, lastVideoId)
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
            const videoStats = await onlyProd(() => getVideoStats(v.id, userId), {
                views: [],
                shares: [],
                downloads: [],
                likes: [],
                comments: [],
                bookmarks: [],
            })
            return flattenObject({
                id: v.id,
                ...videoData,
                thumbnail: recoverThumbnail(videoData.thumbnail),
                videoUrl: replaceWithCDN(videoData.videoUrl),
                timestamp: serializeTimestamp(videoData.timestamp),
                ...videoStats,
            })
        }),
    )

    return videos as unknown as VideoWithStats[]
}

async function getVideosFromProfile(
    userId: string,
    loggedInUserId: string | undefined,
    videoId: string | undefined,
) {
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
            const videoStats = await getVideoStats(v.id, loggedInUserId)
            const videoData = v.data()
            delete videoData["campaignMeta"]
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

export async function getVideo(videoId: string, userId: string | undefined) {
    const videoDocRef = doc(db, "videos", videoId)
    const videoDoc = await getDoc(videoDocRef)

    if (!videoDoc.exists()) return null

    const videoStats = await getVideoStats(videoId, userId)

    return flattenObject({
        id: videoDoc.id,
        ...videoDoc.data(),
        ...videoStats,
    }) as unknown as VideoWithStats
}

export async function getUserUploadedVideos(userId: string) {
    const q = query(
        collection(db, "videos"),
        and(where("userId", "==", userId), where("broken", "==", false)),
        orderBy("timestamp", "desc"),
    )
    const videoDocsRef = await getDocs(q)
    const videos = await Promise.all(
        videoDocsRef.docs.map(async (v) => {
            const videoStats = await getVideoStats(v.id, userId)
            return flattenObject({ id: v.id, ...v.data(), ...videoStats })
        }),
    )
    return videos as unknown as VideoWithStats[]
}

export async function getMultiVideosData(videoIds: string[]) {
    const videos = await Promise.all(
        videoIds.map(async (v) => {
            // ignore userId as we dont need to get the comments for this one
            return getVideo(v, undefined)
        }),
    )
    return videos.filter((v) => v !== null)
}

export const getCVideoStats = async (videoId: string, loggedInUserId: string | undefined) =>
    await getVideoStats(videoId, loggedInUserId)
