import { deleteDoc, doc, serverTimestamp, setDoc } from "firebase/firestore"

import { db } from "@/lib/firebase/firebase.browser"

export async function followUser(userId: string, toFollowUserId: string) {
    const myFollowingRef = doc(
        db,
        "users",
        userId,
        "following",
        "organic",
        "userIds",
        toFollowUserId,
    )

    const otherFollowersRef = doc(
        db,
        "users",
        toFollowUserId,
        "followers",
        "organic",
        "userIds",
        userId,
    )
    await Promise.all([
        setDoc(myFollowingRef, { user: toFollowUserId, timestamp: serverTimestamp() }),
        setDoc(otherFollowersRef, { user: userId, timestamp: serverTimestamp() }),
    ])
}

export async function unfollowUser(userId: string, toUnfollowUserId: string) {
    const myFollowingRef = doc(
        db,
        "users",
        userId,
        "following",
        "organic",
        "userIds",
        toUnfollowUserId,
    )

    const otherFollowersRef = doc(
        db,
        "users",
        toUnfollowUserId,
        "followers",
        "organic",
        "userIds",
        userId,
    )

    await Promise.all([deleteDoc(myFollowingRef), deleteDoc(otherFollowersRef)])
}
