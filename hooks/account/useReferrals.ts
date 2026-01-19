"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Referral,
  ReferralFilters,
  ReferralsResponse,
  NetworkStats,
  ApiResponse,
} from "@/types/account"

export function useReferrals(initialFilters?: ReferralFilters) {
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [stats, setStats] = useState<NetworkStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 0,
    hasMore: false,
  })
  const [filters, setFilters] = useState<ReferralFilters>(
    initialFilters || { level: "all", page: 1, limit: 20 }
  )

  const fetchReferrals = useCallback(async (filterParams: ReferralFilters) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (filterParams.level) params.set("level", filterParams.level)
      if (filterParams.page) params.set("page", String(filterParams.page))
      if (filterParams.limit) params.set("limit", String(filterParams.limit))

      const response = await fetch(`/api/account/referrals?${params}`)
      const data: ApiResponse<ReferralsResponse> = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch referrals")
      }

      if (data.data) {
        setReferrals(data.data.referrals)
        setStats(data.data.stats)
        setPagination({
          total: data.data.total,
          page: data.data.page,
          totalPages: data.data.totalPages,
          hasMore: data.data.hasMore,
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch referrals")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchReferrals(filters)
  }, [filters, fetchReferrals])

  const updateFilters = useCallback((newFilters: Partial<ReferralFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }))
  }, [])

  const goToPage = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }))
  }, [])

  return {
    referrals,
    stats,
    loading,
    error,
    pagination,
    filters,
    updateFilters,
    goToPage,
    refetch: () => fetchReferrals(filters),
  }
}
