import { deleteDoc, doc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore"

import { db } from "@/lib/firebase/firebase.browser"

export async function createUser(userId: string) {
    const newUserRef = doc(db, "users", userId)

    await setDoc(newUserRef, {
        uid: userId,
        userName: "",
        createdAt: serverTimestamp(),
        referralCode: userId.slice(0, 10),
    })
}

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

export async function updateProfile({
    userName,
    firstName,
    lastName,
    country,
    userId,
}: {
    userName: string
    firstName: string
    lastName: string
    country: string
    userId: string
}) {
    const userRef = doc(db, "users", userId)
    await updateDoc(userRef, { firstName, lastName, userName, country })
}

export async function updatePreferences(preferences: string[], userId: string) {
    const userRef = doc(db, "users", userId)
    await updateDoc(userRef, { contentPreferences: preferences })
}
