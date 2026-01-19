"use client"

import { useState, useCallback } from "react"
import { Ad, UpdateAdRequest } from "@/types/ads"
import { ApiResponse } from "@/types/account"

export function useUpdateAd() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const updateAd = useCallback(async (adId: string, request: UpdateAdRequest) => {
        try {
            setLoading(true)
            setError(null)
            setSuccess(false)

            const res = await fetch(`/api/ads/${adId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(request),
            })

            const data: ApiResponse<Ad> = await res.json()

            if (!data.success) {
                throw new Error(data.error || "Failed to update ad")
            }

            setSuccess(true)
            return data.data
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to update ad"
            setError(errorMessage)
            throw err
        } finally {
            setLoading(false)
        }
    }, [])

    const deleteAd = useCallback(async (adId: string) => {
        try {
            setLoading(true)
            setError(null)
            setSuccess(false)

            const res = await fetch(`/api/ads/${adId}`, {
                method: "DELETE",
            })

            const data: ApiResponse<null> = await res.json()

            if (!data.success) {
                throw new Error(data.error || "Failed to delete ad")
            }

            setSuccess(true)
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to delete ad"
            setError(errorMessage)
            throw err
        } finally {
            setLoading(false)
        }
    }, [])

    const reset = useCallback(() => {
        setLoading(false)
        setError(null)
        setSuccess(false)
    }, [])

    return { updateAd, deleteAd, loading, error, success, reset }
}
