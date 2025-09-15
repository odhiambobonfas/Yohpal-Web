import { getError } from "@/lib/utils"
import { getUserProfile } from "@/services/client/user"
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

    return { loading, error, getProfile }
}
