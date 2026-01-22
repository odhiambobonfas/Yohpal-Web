"use client"

import { useState, useCallback } from "react"
import { Ad, RepublishAdRequest } from "@/types/ads"
import { ApiResponse } from "@/types/account"

export function useRepublishAd() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const republishAd = useCallback(async (adId: string, amountToAllocate: number) => {
        try {
            setLoading(true)
            setError(null)
            setSuccess(false)

            const request: RepublishAdRequest = { amountToAllocate }

            const res = await fetch(`/api/ads/${adId}/republish`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(request),
            })

            const data: ApiResponse<Ad> = await res.json()

            if (!data.success) {
                throw new Error(data.error || "Failed to republish ad")
            }

            setSuccess(true)
            return data.data
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to republish ad"
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

    return { republishAd, loading, error, success, reset }
}
