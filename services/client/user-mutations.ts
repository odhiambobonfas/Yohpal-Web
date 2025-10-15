import { doc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore"

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
