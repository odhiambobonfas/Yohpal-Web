"use client"

import { useAccountBalance, useTransactions } from "@/hooks/account"
import { StatsCards } from "@/components/custom/account/dashboard/StatsCards"
import { EarningsBreakdown } from "@/components/custom/account/dashboard/EarningsBreakdown"
import { QuickActions } from "@/components/custom/account/dashboard/QuickActions"
import { RecentTransactions } from "@/components/custom/account/dashboard/RecentTransactions"
import { useAuth } from "@/providers/Auth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AccountDashboard() {
  const { balance, loading: balanceLoading } = useAccountBalance()
  const { transactions, loading: transactionsLoading } = useTransactions({ limit: 5 })
  const { profile, loading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && profile) {
      if (!profile.businessProfile?.verificationStatus) {
        router.push("/account/onboarding")
      }
    }
  }, [profile, authLoading, router])

  if (authLoading || (profile && !profile.businessProfile?.verificationStatus)) {
      return (
          <div className="flex h-[50vh] items-center justify-center">
             <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
      )
  }

  const business = profile?.businessProfile

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Account Overview</h1>
          <div className="flex items-center gap-2 text-muted-foreground">
             <span>{business?.businessName || "My Business"}</span>
             {business?.verificationStatus && (
                 <Badge variant={business.verificationStatus === "verified" ? "default" : "secondary"}>
                     {business.verificationStatus.toUpperCase()}
                 </Badge>
             )}
          </div>
        </div>
        <div className="flex gap-2">
            <Button>Upload Ad</Button>
            <Button variant="outline">Deposit Funds</Button>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
          <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">KES {business?.totalSpent?.toFixed(2) || "0.00"}</div>
              </CardContent>
          </Card>
           <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Remaining Balance</CardTitle>
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">KES {business?.walletBalance?.toFixed(2) || "0.00"}</div>
              </CardContent>
          </Card>
      </div>

      <StatsCards balance={balance} loading={balanceLoading} />

      <div className="grid gap-6 md:grid-cols-2">
        <EarningsBreakdown balance={balance} loading={balanceLoading} />
        <QuickActions />
      </div>

      <RecentTransactions transactions={transactions} loading={transactionsLoading} />
    </div>
  )
}
