"use client"
import { useState } from "react"

import { FOLLOWER_FOLLOWING_LIMIT } from "@/constants"
import { getError } from "@/lib/utils"
import {
    getBookmarkedVideos,
    getLikedVideos,
    getUserfollowers,
    getUserfollowing,
    getUserProfile,
    getVideoViews,
    getWatchedVideos,
} from "@/services/client/user"
import { getUserUploadedVideos } from "@/services/client/video"

export function useUser() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const getProfile = async (userId: string) => {
        try {
            setLoading(true)
            setError(null)
            return getUserProfile(userId)
        } catch (e) {
            const errorMsg = getError(e) || "Failed to load profile"
            setError(errorMsg)
            return null
        } finally {
            setLoading(false)
        }
    }

    const getProfileStats = async (userId: string) => {
        try {
            setLoading(true)
            setError(null)

            const [uploaded, followers, following, liked, viewed] = await Promise.all([
                getUserUploadedVideos(userId),
                getUserfollowers(userId, undefined),
                getUserfollowing(userId, undefined),
                getLikedVideos(userId),
                getVideoViews(userId),
            ])

            return {
                uploadedStat: uploaded.length,
                followersStat: followers,
                followingStat: following.length,
                likedStat: liked.length,
                viewedStat: viewed.length,
            }
        } catch (e) {
            const errorMsg = getError(e) || "Failed to get profile details"
            setError(errorMsg)
            return null
        } finally {
            setLoading(false)
        }
    }

    const getProfileVideos = async (userId: string) => {
        try {
            setLoading(true)
            setError(null)

            const [uploaded, liked, bookmarked, watched] = await Promise.all([
                getUserUploadedVideos(userId),
                getLikedVideos(userId),
                getBookmarkedVideos(userId),
                getWatchedVideos(userId),
            ])

            return { uploaded, liked, bookmarked, watched }
        } catch (e) {
            const errorMsg = getError(e) || "Failed to get profile videos"
            setError(errorMsg)
        } finally {
            setLoading(false)
        }
    }

    const getFollowers = async (userId: string) => {
        try {
            setLoading(true)
            setError(null)
            return await getUserfollowers(userId, undefined)
        } catch (e) {
            const errorMsg = getError(e) || "Failed to get user followers"
            setError(errorMsg)
            return null
        } finally {
            setLoading(false)
        }
    }

    const getFollowing = async (userId: string) => {
        try {
            setLoading(true)
            setError(null)
            return await getUserfollowing(userId, undefined)
        } catch (e) {
            const errorMsg = getError(e) || "Failed to get user following"
            setError(errorMsg)
            return null
        } finally {
            setLoading(false)
        }
    }

    const getFollowersProfile = async (userId: string) => {
        try {
            setLoading(true)
            setError(null)
            return (
                await Promise.all(
                    (await getUserfollowers(userId, FOLLOWER_FOLLOWING_LIMIT)).map(
                        async (u) => await getUserProfile(u),
                    ),
                )
            ).filter((u) => u != null)
        } catch (e) {
            const errorMsg = getError(e) || "Failed to get user followers profiles"
            setError(errorMsg)
        }
    }

    const getFollowingProfile = async (userId: string) => {
        try {
            setLoading(true)
            setError(null)
            return (
                await Promise.all(
                    (await getUserfollowing(userId, FOLLOWER_FOLLOWING_LIMIT)).map(
                        async (u) => await getUserProfile(u),
                    ),
                )
            ).filter((u) => u != null)
        } catch (e) {
            const errorMsg = getError(e) || "Failed to get user following profiles"
            setError(errorMsg)
        }
    }
    return {
        loading,
        error,
        getProfile,
        getProfileVideos,
        getProfileStats,
        getFollowers,
        getFollowing,
        getFollowersProfile,
        getFollowingProfile,
    }
}
