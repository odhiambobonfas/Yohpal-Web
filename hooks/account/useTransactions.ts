"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Transaction,
  TransactionFilters,
  TransactionHistoryResponse,
  ApiResponse,
} from "@/types/account"

export function useTransactions(initialFilters?: TransactionFilters) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 0,
    hasMore: false,
  })
  const [filters, setFilters] = useState<TransactionFilters>(
    initialFilters || { type: "all", status: "all", page: 1, limit: 20 }
  )

  const fetchTransactions = useCallback(async (filterParams: TransactionFilters) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (filterParams.type) params.set("type", filterParams.type)
      if (filterParams.status) params.set("status", filterParams.status)
      if (filterParams.startDate) params.set("startDate", filterParams.startDate)
      if (filterParams.endDate) params.set("endDate", filterParams.endDate)
      if (filterParams.page) params.set("page", String(filterParams.page))
      if (filterParams.limit) params.set("limit", String(filterParams.limit))

      const response = await fetch(`/api/account/transactions?${params}`)
      const data: ApiResponse<TransactionHistoryResponse> = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch transactions")
      }

      if (data.data) {
        setTransactions(data.data.transactions)
        setPagination({
          total: data.data.total,
          page: data.data.page,
          totalPages: data.data.totalPages,
          hasMore: data.data.hasMore,
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch transactions")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTransactions(filters)
  }, [filters, fetchTransactions])

  const updateFilters = useCallback((newFilters: Partial<TransactionFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }))
  }, [])

  const goToPage = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }))
  }, [])

  return {
    transactions,
    loading,
    error,
    pagination,
    filters,
    updateFilters,
    goToPage,
    refetch: () => fetchTransactions(filters),
  }
}
