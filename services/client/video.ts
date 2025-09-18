import { db } from "@/lib/firebase/firebase.browser"
import { Video, VideoComment } from "#/videos"
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
    where,
} from "firebase/firestore"
import { DOC } from "."
import { replaceWithCDN, serializeTimestamp } from "@/lib/utils"
import { VIDEO_LIMIT } from "@/constants"

export async function getVideos(lastVideoId: string) {
    const videosRef = collection(db, "videos")
    const lastVideoRef = await getDoc(doc(videosRef, lastVideoId))

    const videoDocsQuery = query(
        videosRef,
        orderBy("timestamp", "desc"),
        orderBy(documentId(), "desc"),
        startAfter(lastVideoRef),
        where("broken", "==", false),
        limit(VIDEO_LIMIT),
    )

    const videoDocs = await getDocs(videoDocsQuery)

    const videos = videoDocs.docs.map((v) => {
        const videoData = v.data()
        return {
            id: v.id,
            ...videoData,
            videoUrl: replaceWithCDN(videoData.videoUrl),
            timestamp: serializeTimestamp(videoData.timestamp),
        }
    })

    return videos as unknown as Video[]
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
    )
    const videoDocsRef = await getDocs(q)
    return videoDocsRef.docs.map((v) => ({ id: v.id, ...v.data() })) as unknown as Video[]
}

export async function getUserLikedVideos(userId: string) {
    const q = query(collection(db, "users"), where("userId", "==", userId))
    const videoDocsRef = await getDocs(q)
    const videos = videoDocsRef.docs.map((v) => ({ id: v.id, ...v.data() })) as unknown as Video[]
    return videos.filter((v) => !v.broken)
}
