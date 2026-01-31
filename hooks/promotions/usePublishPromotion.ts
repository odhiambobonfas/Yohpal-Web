"use client"

import { useState, useCallback } from "react"
import { VideoPromotion, PublishVideoPromotionRequest, AdViewFrequency } from "@/types/ads"
import { ApiResponse } from "@/types/account"

export function usePublishPromotion() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const publishPromotion = useCallback(async (promotionId: string, amountToAllocate: number, viewFrequency?: AdViewFrequency) => {
        try {
            setLoading(true)
            setError(null)
            setSuccess(false)

            const request: PublishVideoPromotionRequest = { amountToAllocate, viewFrequency }

            const res = await fetch(`/api/promotions/${promotionId}/publish`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(request),
            })

            const data: ApiResponse<VideoPromotion> = await res.json()

            if (!data.success) {
                throw new Error(data.error || "Failed to publish promotion")
            }

            setSuccess(true)
            return data.data
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to publish promotion"
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

    return { publishPromotion, loading, error, success, reset }
}
