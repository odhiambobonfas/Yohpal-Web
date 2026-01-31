"use client"

import { useState, useEffect, useCallback } from "react"
import { UserVideo } from "@/types/ads"
import { ApiResponse } from "@/types/account"

export function useUserVideos() {
    const [videos, setVideos] = useState<UserVideo[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchVideos = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            const res = await fetch("/api/promotions/videos")
            const data: ApiResponse<UserVideo[]> = await res.json()

            if (!data.success) {
                throw new Error(data.error || "Failed to fetch videos")
            }

            setVideos(data.data || [])
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch videos")
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchVideos()
    }, [fetchVideos])

    return {
        videos,
        loading,
        error,
        refetch: fetchVideos,
    }
}
