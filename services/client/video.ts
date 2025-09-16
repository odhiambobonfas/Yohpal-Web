import { db } from "@/lib/firebase/firebase.browser"
import { Video } from "#/videos"
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore"
import { DOC } from "."

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

export async function getUserUploadedVideos(userId: string) {
    const q = query(collection(db, "videos"), where("userId", "==", userId))
    const videoDocsRef = await getDocs(q)
    const videos = videoDocsRef.docs.map((v) => ({ id: v.id, ...v.data() })) as unknown as Video[]
    return videos.filter((v) => !v.broken)
}

export async function getUserLikedVideos(userId: string) {
    // const q = query(collection(db, "users",), where("userId", "==", userId))
    // const videoDocsRef = await getDocs(q)
    // const videos = videoDocsRef.docs.map((v) => ({ id: v.id, ...v.data() })) as unknown as Video[]
    // return videos.filter((v) => !v.broken)
}
