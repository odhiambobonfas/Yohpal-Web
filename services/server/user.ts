import { db } from "@/lib/firebase/firebase.admin"
import { YPUser } from "#/users"
import { DOC } from "@/services"
import { getUserVideoUploads } from "./videos"

export async function getUserProfile(userId: string) {
    const userDoc = await db.collection("users").doc(userId).get()
    if (!userDoc.exists) return null

    const user = userDoc.data() as unknown as YPUser

    return {
        userName: user.userName,
        email: user.email,
        bio: user.bio,
        phoneNumber: user.phoneNumber,
        profile_picture: user.profile_picture,
    } as unknown as YPUser
}

export async function getUserProfileStats(userId: string) {
    const [followers, following, uploadedVideos, views, likes] = await Promise.all([
        getFollowersCount(userId),
        getFollowingCount(userId),
        getUserVideoUploads(userId),
        getViewsCount(userId),
        getLikedCount(userId),
    ])

    return {
        followers: followers.length,
        following: following.length,
        uploadedVideos: uploadedVideos.length,
        views: views.length,
        likes: likes.length,
    }
}

async function getFollowingCount(userId: string) {
    const followingDocs = await db
        .collection("users")
        .doc(userId)
        .collection("following")
        .doc("organic")
        .collection("userIds")
        .get()

    if (followingDocs.empty) return []
    return followingDocs.docs.map((f) => f.id)
}

async function getFollowersCount(userId: string) {
    const followerDocs = await db
        .collection("users")
        .doc(userId)
        .collection("followers")
        .doc("organic")
        .collection("userIds")
        .get()

    if (followerDocs.empty) return []
    return followerDocs.docs.map((f) => f.id)
}

async function getViewsCount(userId: string) {
    const viewsDocs = await db
        .collection("users")
        .doc(userId)
        .collection("views")
        .doc(DOC)
        .collection("videoIds")
        .get()
    if (viewsDocs.empty) return []
    return viewsDocs.docs.map((v) => v.id)
}

async function getLikedCount(userId: string) {
    const likesDocs = await db
        .collection("users")
        .doc(userId)
        .collection("likes")
        .doc(DOC)
        .collection("videoIds")
        .get()
    if (likesDocs.empty) return []
    return likesDocs.docs.map((l) => l.id)
}
