import { YPUser } from "#/users"
import { withCache } from "@/lib/cache"
import { onlyProd } from "@/lib/dev"
import { db } from "@/lib/firebase/firebase.admin"
import { replaceWithCDN } from "@/lib/utils"
import { DOC } from "@/services"
import { getUserVideoUploads } from "./videos"

export const getUserProfile = async (userId: string) => {
    return withCache(async () => {
        const userDoc = await db.collection("users").doc(userId).get()
        if (!userDoc.exists) return null
        const user = userDoc.data() as unknown as YPUser
        return {
            uid: user.uid,
            userName: user.userName,
            email: user.email,
            bio: user.bio,
            phoneNumber: user.phoneNumber,
            profile_picture: replaceWithCDN(user.profile_picture),
        } as unknown as YPUser
    }, `user:profile:${userId}`)
}

export const getUserProfileStats = async (userId: string) => {
    return withCache(async () => {
        const [followers, following, uploadedVideos, friends, views, likes] = await Promise.all([
            getFollowersCount(userId),
            getFollowingCount(userId, undefined),
            getUserVideoUploads(userId, undefined, undefined),
            getFriendsCount(userId, undefined),
            onlyProd(() => getViewsCount(userId), []),
            onlyProd(() => getLikedCount(userId), []),
        ])
        return {
            followers: followers,
            following: following.length,
            uploadedVideos: uploadedVideos.length,
            friends: friends.length,
            views: views.length,
            likes: likes.length,
        }
    }, `user:profile:stats:${userId}`)
}

export const getFriendsCount = async (userId: string, limit: number | undefined) => {
    const friendsFilter = async () => {
        const [followers, following] = await Promise.all([
            getFollowersCount(userId),
            getFollowingCount(userId, limit),
        ])

        const followerSet = new Set(followers)
        const friends = following.filter((uid) => followerSet.has(uid))
        return friends
    }

    return withCache(friendsFilter, `user:friends:${userId}`)
}

export const getFollowingCount = async (userId: string, limit: number | undefined) => {
    return withCache(
        async () => {
            const followingDoc = db
                .collection("users")
                .doc(userId)
                .collection("following")
                .doc("organic")
                .collection("userIds")

            const query = limit ? followingDoc.limit(limit) : followingDoc

            const followingDocs = await query.get()
            if (followingDocs.empty) return []
            return followingDocs.docs.map((f) => f.id)
        },
        `user:following:${userId}:${limit || "all"}`,
    )
}

const getFollowersCount = async (userId: string) => {
    return withCache(async () => {
        const followerDocs = await db
            .collection("users")
            .doc(userId)
            .collection("followers")
            .doc("organic")
            .collection("userIds")
            .get()
        if (followerDocs.empty) return []
        return followerDocs.docs.map((f) => f.id)
    }, `user:followers:${userId}`)
}

const getViewsCount = async (userId: string) => {
    return withCache(async () => {
        const viewsDocs = await db
            .collection("users")
            .doc(userId)
            .collection("views")
            .doc(DOC)
            .collection("videoIds")
            .get()
        if (viewsDocs.empty) return []
        return viewsDocs.docs.map((v) => v.id)
    }, `user:views:${userId}`)
}

const getLikedCount = async (userId: string) => {
    return withCache(async () => {
        const likesDocs = await db
            .collection("users")
            .doc(userId)
            .collection("likes")
            .doc(DOC)
            .collection("videoIds")
            .get()
        if (likesDocs.empty) return []
        return likesDocs.docs.map((l) => l.id)
    }, `user:likes:${userId}`)
}

export const getBlocked = async (userId: string | undefined) => {
    if (!userId) return []

    return withCache(async () => {
        const blockedDocs = await db
            .collection("users")
            .doc(userId)
            .collection("blocked")
            .doc(DOC)
            .collection("userIds")
            .get()
        if (blockedDocs.empty) return []
        return blockedDocs.docs.map((b) => b.id)
    }, `user:blocked:${userId}`)
}
