"use client"

import { useState, useEffect, useCallback } from "react"
import { Ad, AdsListResponse, AdFilterType } from "@/types/ads"
import { ApiResponse } from "@/types/account"

interface UseAdsOptions {
    page?: number
    limit?: number
    filter?: AdFilterType
}

export function useAds(options: UseAdsOptions = {}) {
    const { page = 1, limit = 10, filter = "all" } = options
    const [ads, setAds] = useState<Ad[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [total, setTotal] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [hasMore, setHasMore] = useState(false)

    const fetchAds = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                filter,
            })

            const res = await fetch(`/api/ads?${params}`)
            const data: ApiResponse<AdsListResponse> = await res.json()

            if (!data.success) {
                throw new Error(data.error || "Failed to fetch ads")
            }

            setAds(data.data?.ads || [])
            setTotal(data.data?.total || 0)
            setTotalPages(data.data?.totalPages || 0)
            setHasMore(data.data?.hasMore || false)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch ads")
        } finally {
            setLoading(false)
        }
    }, [page, limit, filter])

    useEffect(() => {
        fetchAds()
    }, [fetchAds])

    return {
        ads,
        loading,
        error,
        total,
        totalPages,
        hasMore,
        refetch: fetchAds,
    }
}
