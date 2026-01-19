"use client"

import { useState, useCallback } from "react"
import { DepositRequest, DepositResponse, ApiResponse } from "@/types/account"

export function useDeposit() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [response, setResponse] = useState<DepositResponse | null>(null)

  const deposit = useCallback(async (request: DepositRequest) => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(false)
      setResponse(null)

      const res = await fetch("/api/account/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      })

      const data: ApiResponse<DepositResponse> = await res.json()

      if (!data.success) {
        throw new Error(data.error || "Deposit request failed")
      }

      setResponse(data.data || null)
      setSuccess(true)
      return data.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Deposit request failed"
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
    setResponse(null)
  }, [])

  return { deposit, loading, error, success, response, reset }
}
