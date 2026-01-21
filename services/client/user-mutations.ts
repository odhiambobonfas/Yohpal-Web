import { doc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore"

import { DEFAULT_REFERER_CODE } from "@/constants"
import { db } from "@/lib/firebase/firebase.browser"
import { logger } from "@/lib/logger"
import { BusinessProfile } from "@/types/users"

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

export async function updateBusinessProfile(data: Partial<BusinessProfile>, userId: string) {
    const userRef = doc(db, "users", userId)
    const businessProfileRef = doc(db, "business_profiles", userId)

    try {
        // Construct update data for user document (nested businessProfile field)
        const updateData: Record<string, unknown> = {}
        for (const [key, value] of Object.entries(data)) {
            updateData[`businessProfile.${key}`] = value
        }

        // Update the user document with nested businessProfile
        await updateDoc(userRef, updateData)

        // Also store in the separate business_profiles collection
        await setDoc(
            businessProfileRef,
            {
                ...data,
                userId,
                updatedAt: serverTimestamp(),
                createdAt: serverTimestamp(),
            },
            { merge: true }
        )
    } catch (error) {
        logger.error("Error updating business profile", error)
        throw error
    }
}
