"use client"

import { useState, useCallback } from "react"
import { VideoPromotion, CreateVideoPromotionRequest } from "@/types/ads"
import { ApiResponse } from "@/types/account"

export function useCreatePromotion() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [createdPromotion, setCreatedPromotion] = useState<VideoPromotion | null>(null)

    const createPromotion = useCallback(async (videoId: string) => {
        try {
            setLoading(true)
            setError(null)
            setSuccess(false)
            setCreatedPromotion(null)

            const request: CreateVideoPromotionRequest = { videoId }

            const res = await fetch("/api/promotions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(request),
            })

            const data: ApiResponse<VideoPromotion> = await res.json()

            if (!data.success) {
                throw new Error(data.error || "Failed to create promotion")
            }

            setCreatedPromotion(data.data || null)
            setSuccess(true)
            return data.data
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to create promotion"
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
        setCreatedPromotion(null)
    }, [])

    return { createPromotion, loading, error, success, createdPromotion, reset }
}
