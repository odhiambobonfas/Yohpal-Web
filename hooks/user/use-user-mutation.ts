import { useState } from "react"

import {
    blockUserAction,
    followUserAction,
    unfollowUserAction,
} from "@/actions/users/user-interaction"
import { getError } from "@/lib/utils"
import { useAuth } from "@/providers/Auth"
import { updatePreferences, updateProfile } from "@/services/client/user-mutations"

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
                await unfollowUserAction(user!.uid, otherUserId)
                return { followed: false }
            } else {
                await followUserAction(user!.uid, otherUserId)
                return { followed: true }
            }
        })
    }

    const completeOnboarding = async ({
        userName,
        firstName,
        lastName,
        country,
        refererCode,
        preferences,
    }: {
        userName: string
        firstName: string
        lastName: string
        country: string
        refererCode: string
        preferences: string[]
    }) => {
        return mutateWithAuth(async () => {
            await Promise.all([
                updateProfile({
                    firstName,
                    lastName,
                    userName,
                    userId: user!.uid,
                    country,
                    refererCode,
                }),
                updatePreferences(preferences, user!.uid),
            ])
        })
    }

    const blockUser = (otherUserId: string) => {
        return mutateWithAuth(async () => {
            await blockUserAction(user!.uid, otherUserId)
        })
    }

    return { loading, error, toggleFollow, completeOnboarding, blockUser }
}
