"use client"

import { useState, useCallback } from "react"
import { Ad, CreateAdRequest } from "@/types/ads"
import { ApiResponse } from "@/types/account"

export function useCreateAd() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [createdAd, setCreatedAd] = useState<Ad | null>(null)

    const createAd = useCallback(async (request: CreateAdRequest) => {
        try {
            setLoading(true)
            setError(null)
            setSuccess(false)
            setCreatedAd(null)

            const res = await fetch("/api/ads", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(request),
            })

            const data: ApiResponse<Ad> = await res.json()

            if (!data.success) {
                throw new Error(data.error || "Failed to create ad")
            }

            setCreatedAd(data.data || null)
            setSuccess(true)
            return data.data
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to create ad"
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
        setCreatedAd(null)
    }, [])

    return { createAd, loading, error, success, createdAd, reset }
}
