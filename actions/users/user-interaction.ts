"use server"
import {
    blockUser,
    followUser,
    unblockUser,
    unfollowUser,
} from "@/services/server/user-interaction"

// NOTE(15c5834672a2)
async function followUserAction(userId: string, toFollowUserId: string) {
    await followUser(userId, toFollowUserId)
}

async function unfollowUserAction(userId: string, toUnfollowUserId: string) {
    await unfollowUser(userId, toUnfollowUserId)
}

const blockUserAction = async (userId: string, toBlockUserId: string) => {
    await blockUser(userId, toBlockUserId)
}

const unblockUserAction = async (userId: string, toBlockUserId: string) => {
    await unblockUser(userId, toBlockUserId)
}

export { blockUserAction, followUserAction, unblockUserAction, unfollowUserAction }
