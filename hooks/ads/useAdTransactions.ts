"use client"

import { useState, useEffect, useCallback } from "react"
import { AdTransaction, AdTransactionsResponse } from "@/types/ads"
import { ApiResponse } from "@/types/account"

interface UseAdTransactionsOptions {
    page?: number
    limit?: number
    type?: "deposit" | "ad_spend"
}

export function useAdTransactions(options: UseAdTransactionsOptions = {}) {
    const { page = 1, limit = 10, type } = options
    const [transactions, setTransactions] = useState<AdTransaction[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [total, setTotal] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [hasMore, setHasMore] = useState(false)

    const fetchTransactions = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
            })
            if (type) params.set("type", type)

            const res = await fetch(`/api/ads/wallet/transactions?${params}`)
            const data: ApiResponse<AdTransactionsResponse> = await res.json()

            if (!data.success) {
                throw new Error(data.error || "Failed to fetch transactions")
            }

            setTransactions(data.data?.transactions || [])
            setTotal(data.data?.total || 0)
            setTotalPages(data.data?.totalPages || 0)
            setHasMore(data.data?.hasMore || false)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch transactions")
        } finally {
            setLoading(false)
        }
    }, [page, limit, type])

    useEffect(() => {
        fetchTransactions()
    }, [fetchTransactions])

    return {
        transactions,
        loading,
        error,
        total,
        totalPages,
        hasMore,
        refetch: fetchTransactions,
    }
}
