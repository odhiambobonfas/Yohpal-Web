import { doc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore"

import { DEFAULT_REFERER_CODE } from "@/constants"
import { db } from "@/lib/firebase/firebase.browser"
import { logger } from "@/lib/logger"

export async function createUser(userId: string, email: string) {
    const newUserRef = doc(db, "users", userId)

    await setDoc(newUserRef, {
        uid: userId,
        userName: "",
        email: email,
        createdAt: serverTimestamp(),
        referralCode: userId.slice(0, 10),
    })
}

export async function updateProfile({
    userName,
    firstName,
    lastName,
    country,
    refererCode,
    userId,
}: {
    userName: string
    firstName: string
    lastName: string
    country?: string
    refererCode: string
    userId: string
}) {
    const userRef = doc(db, "users", userId)
    try {
        await updateDoc(userRef, {
            firstName,
            lastName,
            userName,
            country: country ?? "",
            refererCode: refererCode ?? DEFAULT_REFERER_CODE,
        })
    } catch (error) {
        logger.debug("error updating doc", error)
    }
}

export async function updatePreferences(preferences: string[], userId: string) {
    const userRef = doc(db, "users", userId)
    await updateDoc(userRef, { contentPreferences: preferences })
}
