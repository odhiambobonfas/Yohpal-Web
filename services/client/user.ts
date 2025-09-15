import { db } from "@/lib/firebase/firebase.browser"
import { YPUser } from "#/users"
import { doc, getDoc } from "firebase/firestore"

export async function getUserProfile(userId: string) {
    const userDocRef = doc(db, "users", userId)
    const userDoc = await getDoc(userDocRef)

    if (!userDoc.exists()) throw new Error("User not found")

    const data = userDoc.data()
    return { id: userDoc.id, ...data } as unknown as YPUser
}
