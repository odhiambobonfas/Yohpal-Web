"use client"

import { useState, useEffect, useCallback } from "react"
import { AdWalletBalance } from "@/types/ads"
import { ApiResponse } from "@/types/account"

export function useAdWallet() {
    const [wallet, setWallet] = useState<AdWalletBalance | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchWallet = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            const res = await fetch("/api/ads/wallet/balance")
            const data: ApiResponse<AdWalletBalance> = await res.json()

            if (!data.success) {
                throw new Error(data.error || "Failed to fetch wallet balance")
            }

            setWallet(data.data || null)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch wallet balance")
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchWallet()
    }, [fetchWallet])

    return {
        wallet,
        balance: wallet?.balance ?? 0,
        totalDeposited: wallet?.totalDeposited ?? 0,
        totalSpent: wallet?.totalSpent ?? 0,
        loading,
        error,
        refetch: fetchWallet,
    }
}
