import { useState } from "react"

import { getError } from "@/lib/utils"
import { useAuth } from "@/providers/Auth"
import {
    followUser,
    unfollowUser,
    updatePreferences,
    updateProfile,
} from "@/services/client/user-mutations"

export function useUserMutation() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const { user } = useAuth()

    const mutateWithAuth = async <T>(
        operation: () => Promise<T>,
        requiresAuth = true,
    ): Promise<T | null> => {
        if (requiresAuth && !user) {
            setError("Authentication required")
            return null
        }

        try {
            setLoading(true)
            setError(null)
            return await operation()
        } catch (e) {
            const errorMsg = getError(e)
            setError(errorMsg)
            return null
        } finally {
            setLoading(false)
        }
    }

    const toggleFollow = async (otherUserId: string, isFollowing: boolean) => {
        return mutateWithAuth(async () => {
            if (isFollowing) {
                await unfollowUser(user!.uid, otherUserId)
                return { followed: false }
            } else {
                await followUser(user!.uid, otherUserId)
                return { followed: true }
            }
        })
    }

    const completeOnboarding = async ({
        userName,
        firstName,
        lastName,
        country,
        preferences,
    }: {
        userName: string
        firstName: string
        lastName: string
        country: string
        preferences: string[]
    }) => {
        return mutateWithAuth(async () => {
            await Promise.all([
                updateProfile({ firstName, lastName, userName, userId: user!.uid, country }),
                updatePreferences(preferences, user!.uid),
            ])
        })
    }

    return { loading, error, toggleFollow, completeOnboarding }
}
