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
    try {
        // We update the nested object using dot notation if we want to update specific fields,
        // but since we are potentially creating it, we might need to be careful.
        // For simplicity with Firestore, we can just merge into the businessProfile field
        // assuming we pass the full object or we use dot notation for partial updates.
        // However, standard updateDoc with nested objects requires map syntax if we don't want to overwrite the whole map.
        // But here, let's assume we update the whole profile or specific fields.
        // Let's use dot notation for safety if it exists, but for now strict replacement of what's passed is okay
        // OR construct the update object.
        
        // Actually, let's just save it as `businessProfile`.
        // If we want to merge, we'd need to read first or use "businessProfile.field": value syntax.
        // For now, let's implementation assuming we pass the object to be merged.
        
        // Construct update data
        const updateData: any = {}
        for (const [key, value] of Object.entries(data)) {
            updateData[`businessProfile.${key}`] = value
        }
        
        await updateDoc(userRef, updateData)
    } catch (error) {
        logger.error("Error updating business profile", error)
        throw error
    }
}
