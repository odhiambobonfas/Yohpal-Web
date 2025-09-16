"use client"
import { getError } from "@/lib/utils"
import {
    getLikedVideos,
    getUserfollowers,
    getUserfollowing,
    getUserProfile,
    getViewedVideos,
    getWatchedVideos,
} from "@/services/client/user"
import { getUserUploadedVideos } from "@/services/client/video"
import { useState } from "react"

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
                getUserfollowers(userId),
                getUserfollowing(userId),
                getLikedVideos(userId),
                getViewedVideos(userId),
            ])

            return {
                uploadedStat: uploaded.length,
                followersStat: followers.length,
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
        } catch (e) {
            const errorMsg = getError(e) || "Failed to load profile"
            setError(errorMsg)
        } finally {
            setLoading(false)
        }
    }

    return { loading, error, getProfile, getProfileVideos, getProfileStats }
}
