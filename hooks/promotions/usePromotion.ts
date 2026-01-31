"use client"

import { useState, useEffect, useCallback } from "react"
import { VideoPromotion } from "@/types/ads"
import { ApiResponse } from "@/types/account"

export function usePromotion(promotionId: string | null) {
    const [promotion, setPromotion] = useState<VideoPromotion | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchPromotion = useCallback(async () => {
        if (!promotionId) {
            setLoading(false)
            return
        }

        try {
            setLoading(true)
            setError(null)

            const res = await fetch(`/api/promotions/${promotionId}`)
            const data: ApiResponse<VideoPromotion> = await res.json()

            if (!data.success) {
                throw new Error(data.error || "Failed to fetch promotion")
            }

            setPromotion(data.data || null)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch promotion")
        } finally {
            setLoading(false)
        }
    }, [promotionId])

    useEffect(() => {
        fetchPromotion()
    }, [fetchPromotion])

    return {
        promotion,
        loading,
        error,
        refetch: fetchPromotion,
    }
}
