"use client"

import { useAccountBalance, useTransactions } from "@/hooks/account"
import { StatsCards } from "@/components/custom/account/dashboard/StatsCards"
import { EarningsBreakdown } from "@/components/custom/account/dashboard/EarningsBreakdown"
import { QuickActions } from "@/components/custom/account/dashboard/QuickActions"
import { RecentTransactions } from "@/components/custom/account/dashboard/RecentTransactions"
import { useAuth } from "@/providers/Auth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2, Mail, Phone, Building2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

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

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="space-y-6">
      {/* Business Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Business Logo */}
            <Avatar className="h-24 w-24 rounded-lg">
              <AvatarImage
                src={business?.businessLogo}
                alt={business?.businessName || "Business Logo"}
                className="object-cover"
              />
              <AvatarFallback className="rounded-lg text-lg">
                {business?.businessName ? getInitials(business.businessName) : "BP"}
              </AvatarFallback>
            </Avatar>

            {/* Business Details */}
            <div className="flex-1 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">
                    {business?.businessName || "My Business"}
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    {business?.category && (
                      <Badge variant="outline" className="capitalize">
                        <Building2 className="h-3 w-3 mr-1" />
                        {business.category}
                      </Badge>
                    )}
                    {business?.verificationStatus && (
                      <Badge
                        variant={business.verificationStatus === "verified" ? "default" : "secondary"}
                      >
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

              {business?.businessDescription && (
                <p className="text-muted-foreground text-sm line-clamp-2">
                  {business.businessDescription}
                </p>
              )}

              {business?.contactInfo && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {business.contactInfo.includes("@") ? (
                    <Mail className="h-4 w-4" />
                  ) : (
                    <Phone className="h-4 w-4" />
                  )}
                  <span>{business.contactInfo}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Wallet Stats */}
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
