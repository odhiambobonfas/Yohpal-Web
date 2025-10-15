"use server"
import { followUser, unfollowUser } from "@/services/server/user-interaction"

// NOTE(15c5834672a2)
async function followUserAction(userId: string, toFollowUserId: string) {
    await followUser(userId, toFollowUserId)
}

async function unfollowUserAction(userId: string, toUnfollowUserId: string) {
    await unfollowUser(userId, toUnfollowUserId)
}

export { followUserAction, unfollowUserAction }
