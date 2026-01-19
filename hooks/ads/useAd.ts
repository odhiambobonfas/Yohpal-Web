"use client"

import { useState, useEffect, useCallback } from "react"
import { AdWithStats } from "@/types/ads"
import { ApiResponse } from "@/types/account"

export function useAd(adId: string | null) {
    const [ad, setAd] = useState<AdWithStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchAd = useCallback(async () => {
        if (!adId) {
            setLoading(false)
            return
        }

        try {
            setLoading(true)
            setError(null)

            const res = await fetch(`/api/ads/${adId}`)
            const data: ApiResponse<AdWithStats> = await res.json()

            if (!data.success) {
                throw new Error(data.error || "Failed to fetch ad")
            }

            setAd(data.data || null)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch ad")
        } finally {
            setLoading(false)
        }
    }, [adId])

    useEffect(() => {
        fetchAd()
    }, [fetchAd])

    return {
        ad,
        loading,
        error,
        refetch: fetchAd,
    }
}
