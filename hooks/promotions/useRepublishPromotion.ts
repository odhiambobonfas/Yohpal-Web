"use client"

import { useState, useCallback } from "react"
import { VideoPromotion, RepublishVideoPromotionRequest, AdViewFrequency } from "@/types/ads"
import { ApiResponse } from "@/types/account"

export function useRepublishPromotion() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const republishPromotion = useCallback(async (promotionId: string, amountToAllocate: number, viewFrequency?: AdViewFrequency) => {
        try {
            setLoading(true)
            setError(null)
            setSuccess(false)

            const request: RepublishVideoPromotionRequest = { amountToAllocate, viewFrequency }

            const res = await fetch(`/api/promotions/${promotionId}/republish`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(request),
            })

            const data: ApiResponse<VideoPromotion> = await res.json()

            if (!data.success) {
                throw new Error(data.error || "Failed to republish promotion")
            }

            setSuccess(true)
            return data.data
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to republish promotion"
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

    return { republishPromotion, loading, error, success, reset }
}
