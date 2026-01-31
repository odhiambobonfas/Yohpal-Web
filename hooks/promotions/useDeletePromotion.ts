"use client"

import { useState, useCallback } from "react"
import { ApiResponse } from "@/types/account"

export function useDeletePromotion() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const deletePromotion = useCallback(async (promotionId: string) => {
        try {
            setLoading(true)
            setError(null)
            setSuccess(false)

            const res = await fetch(`/api/promotions/${promotionId}`, {
                method: "DELETE",
            })

            const data: ApiResponse<{ refunded: number }> = await res.json()

            if (!data.success) {
                throw new Error(data.error || "Failed to delete promotion")
            }

            setSuccess(true)
            return data.data
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to delete promotion"
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

    return { deletePromotion, loading, error, success, reset }
}
