"use client"

import { useState, useEffect, useCallback } from "react"
import { VideoPromotion, VideoPromotionsListResponse, PromotionFilterType } from "@/types/ads"
import { ApiResponse } from "@/types/account"

interface UsePromotionsOptions {
    page?: number
    limit?: number
    filter?: PromotionFilterType
}

export function usePromotions(options: UsePromotionsOptions = {}) {
    const { page = 1, limit = 10, filter = "all" } = options
    const [promotions, setPromotions] = useState<VideoPromotion[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [total, setTotal] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [hasMore, setHasMore] = useState(false)

    const fetchPromotions = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                filter,
            })

            const res = await fetch(`/api/promotions?${params}`)
            const data: ApiResponse<VideoPromotionsListResponse> = await res.json()

            if (!data.success) {
                throw new Error(data.error || "Failed to fetch promotions")
            }

            setPromotions(data.data?.promotions || [])
            setTotal(data.data?.total || 0)
            setTotalPages(data.data?.totalPages || 0)
            setHasMore(data.data?.hasMore || false)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch promotions")
        } finally {
            setLoading(false)
        }
    }, [page, limit, filter])

    useEffect(() => {
        fetchPromotions()
    }, [fetchPromotions])

    return {
        promotions,
        loading,
        error,
        total,
        totalPages,
        hasMore,
        refetch: fetchPromotions,
    }
}
