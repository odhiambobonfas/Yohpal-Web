'use server'
import { db, serverTimestamp } from "@/lib/firebase/firebase.admin"



async function followUserAction(userId: string, toFollowUserId: string) {
    const myFollowingRef = db
        .collection("users")
        .doc(userId)
        .collection("following")
        .doc("organic")
        .collection("userIds")
        .doc(toFollowUserId)

    const otherFollowersRef = db
        .collection("users")
        .doc(toFollowUserId)
        .collection("followers")
        .doc("organic")
        .collection("userIds")
        .doc(userId)

    await Promise.all([
        myFollowingRef.set({ user: toFollowUserId, timestamp: serverTimestamp() }),
        otherFollowersRef.set({ user: userId, timestamp: serverTimestamp() }),
    ])
}

async function unfollowUserAction(userId: string, toUnfollowUserId: string) {
    const myFollowingRef = db
        .collection("users")
        .doc(userId)
        .collection("following")
        .doc("organic")
        .collection("userIds")
        .doc(toUnfollowUserId)

    const otherFollowersRef = db
        .collection("users")
        .doc(toUnfollowUserId)
        .collection("followers")
        .doc("organic")
        .collection("userIds")
        .doc(userId)

    await Promise.all([myFollowingRef.delete(), otherFollowersRef.delete()])
}


export { followUserAction, unfollowUserAction }
