"use client"

import { useReferrals } from "@/hooks/account"
import { NetworkStats } from "@/components/custom/account/network/NetworkStats"
import { ReferralCodeCard } from "@/components/custom/account/network/ReferralCodeCard"
import { ReferralsList } from "@/components/custom/account/network/ReferralsList"

export default function NetworkPage() {
  const { referrals, stats, loading, pagination, filters, updateFilters, goToPage } =
    useReferrals()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Referral Network</h1>
        <p className="text-muted-foreground">
          Grow your network and earn rewards for every referral
        </p>
      </div>

      <NetworkStats stats={stats} loading={loading} />

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <ReferralsList
            referrals={referrals}
            loading={loading}
            pagination={pagination}
            filters={filters}
            onFilterChange={updateFilters}
            onPageChange={goToPage}
          />
        </div>
        <div>
          <ReferralCodeCard stats={stats} loading={loading} />
        </div>
      </div>
    </div>
  )
}
