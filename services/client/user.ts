import { db } from "@/lib/firebase/firebase.browser"
import { YPUser } from "#/users"
import { collection, doc, getDoc, getDocs } from "firebase/firestore"
import { DOC } from "@/services"
import { getMultiVideosData } from "./video"

export async function getUserProfile(userId: string) {
    const userDocRef = doc(db, "users", userId)
    const userDoc = await getDoc(userDocRef)

    if (!userDoc.exists()) throw new Error("User not found")

    const data = userDoc.data()
    return { id: userDoc.id, ...data } as unknown as YPUser
}

export async function getUserfollowers(userId: string) {
    const userFollowersRef = collection(db, "users", userId, "followers", "organic", "userIds")
    const userFollowersDocs = await getDocs(userFollowersRef)
    if (userFollowersDocs.empty) return []

    return userFollowersDocs.docs.map((f) => f.id)
}

export async function getUserfollowing(userId: string) {
    const userFollowersRef = collection(db, "users", userId, "following", "organic", "userIds")
    const userFollowersDocs = await getDocs(userFollowersRef)
    if (userFollowersDocs.empty) return []

    return userFollowersDocs.docs.map((f) => f.id)
}

export async function getWatchedVideos(userId: string) {
    const profileStatsRef = collection(db, "users", userId, "watched", DOC, "videoIds")
    const profileStatsDocs = await getDocs(profileStatsRef)
    if (profileStatsDocs.empty) return []

    const videoIds = profileStatsDocs.docs.map((v) => v.id)

    return getMultiVideosData(videoIds)
}

export async function getVideoViews(userId: string) {
    const profileStatsRef = collection(db, "users", userId, "views", DOC, "videoIds")
    const profileStatsDocs = await getDocs(profileStatsRef)
    if (profileStatsDocs.empty) return []

    const videoIds = profileStatsDocs.docs.map((f) => f.id)
    return getMultiVideosData(videoIds)
}

export async function getLikedVideos(userId: string) {
    const profileStatsRef = collection(db, "users", userId, "likes", DOC, "videoIds")
    const profileStatsDocs = await getDocs(profileStatsRef)
    if (profileStatsDocs.empty) return []

    const videoIds = profileStatsDocs.docs.map((f) => f.id)
    return getMultiVideosData(videoIds)
}

export async function getBookmarkedVideos(userId: string) {
    const profileStatsRef = collection(db, "users", userId, "bookmarks", DOC, "videoIds")
    const profileStatsDocs = await getDocs(profileStatsRef)
    if (profileStatsDocs.empty) return []

    const videoIds = profileStatsDocs.docs.map((f) => f.id)
    return getMultiVideosData(videoIds)
}
