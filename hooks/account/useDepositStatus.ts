"use client"

import { useState, useCallback, useRef, useEffect } from "react"

export type DepositStatus = "idle" | "pending" | "completed" | "failed" | "cancelled"

interface DepositStatusResult {
  status: DepositStatus
  message: string
  resultCode?: string
}

interface UseDepositStatusReturn {
  status: DepositStatus
  message: string
  startPolling: (checkoutRequestId: string) => void
  stopPolling: () => void
  reset: () => void
}

const POLL_INTERVAL = 3000 // 3 seconds
const MAX_POLL_ATTEMPTS = 40 // 2 minutes max (40 * 3 seconds)

export function useDepositStatus(): UseDepositStatusReturn {
  const [status, setStatus] = useState<DepositStatus>("idle")
  const [message, setMessage] = useState("")
  const pollRef = useRef<NodeJS.Timeout | null>(null)
  const attemptRef = useRef(0)

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
    attemptRef.current = 0
  }, [])

  const queryStatus = useCallback(async (checkoutRequestId: string): Promise<DepositStatusResult> => {
    try {
      const res = await fetch("/api/mpesa/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checkoutRequestId }),
      })

      const data = await res.json()

      if (!data.success) {
        return { status: "pending", message: "Checking payment status..." }
      }

      const result = data.data

      if (result.status === "completed") {
        return {
          status: "completed",
          message: "Payment successful! Your balance has been updated.",
          resultCode: result.resultCode
        }
      } else if (result.status === "failed") {
        // Interpret common result codes
        const code = result.resultCode
        const failMessage = result.resultDesc || "Payment failed"

        if (code === "1032") {
          return { status: "cancelled", message: "You cancelled the transaction", resultCode: code }
        } else if (code === "1037") {
          return { status: "failed", message: "Could not reach your phone. Please try again.", resultCode: code }
        } else if (code === "2001") {
          return { status: "failed", message: "Wrong M-Pesa PIN entered", resultCode: code }
        } else if (code === "1") {
          return { status: "failed", message: "Insufficient M-Pesa balance", resultCode: code }
        }

        return { status: "failed", message: failMessage, resultCode: code }
      }

      return { status: "pending", message: "Waiting for you to enter M-Pesa PIN..." }
    } catch {
      return { status: "pending", message: "Checking payment status..." }
    }
  }, [])

  const startPolling = useCallback((checkoutRequestId: string) => {
    // Reset state
    setStatus("pending")
    setMessage("Waiting for you to enter M-Pesa PIN...")
    attemptRef.current = 0

    // Stop any existing polling
    stopPolling()

    // Start polling
    pollRef.current = setInterval(async () => {
      attemptRef.current += 1

      // Check max attempts
      if (attemptRef.current >= MAX_POLL_ATTEMPTS) {
        stopPolling()
        setStatus("failed")
        setMessage("Transaction timed out. Please check your M-Pesa messages.")
        return
      }

      const result = await queryStatus(checkoutRequestId)
      setMessage(result.message)

      if (result.status !== "pending") {
        stopPolling()
        setStatus(result.status)
      }
    }, POLL_INTERVAL)
  }, [stopPolling, queryStatus])

  const reset = useCallback(() => {
    stopPolling()
    setStatus("idle")
    setMessage("")
  }, [stopPolling])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling()
    }
  }, [stopPolling])

  return { status, message, startPolling, stopPolling, reset }
}
