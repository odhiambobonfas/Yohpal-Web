"use client"

import { useState, useEffect, useCallback } from "react"
import { AccountBalance, ApiResponse } from "@/types/account"

export function useAccountBalance() {
  const [balance, setBalance] = useState<AccountBalance | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBalance = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/account/balance")
      const data: ApiResponse<AccountBalance> = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch balance")
      }

      setBalance(data.data || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch balance")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBalance()
  }, [fetchBalance])

  return { balance, loading, error, refetch: fetchBalance }
}
