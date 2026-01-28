"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useAccountBalance, useTransactions } from "@/hooks/account"
import { StatsCards } from "@/components/custom/account/dashboard/StatsCards"
import { EarningsBreakdown } from "@/components/custom/account/dashboard/EarningsBreakdown"
import { QuickActions } from "@/components/custom/account/dashboard/QuickActions"
import { RecentTransactions } from "@/components/custom/account/dashboard/RecentTransactions"
import { EditProfileSheet } from "@/components/custom/account/profile/EditProfileSheet"
import { useAuth } from "@/providers/Auth"
import { useRouter } from "next/navigation"
import { Loader2, Mail, Phone, Building2, Pencil } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function AccountDashboard() {
  const { balance, loading: balanceLoading, refetch: refetchBalance } = useAccountBalance()
  const { transactions, loading: transactionsLoading } = useTransactions({ limit: 5 })
  const { profile, loading: authLoading, user, refreshProfile } = useAuth()
  const router = useRouter()
  const [editSheetOpen, setEditSheetOpen] = useState(false)

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
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setEditSheetOpen(true)}
                    title="Edit Profile"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button asChild>
                    <Link href="/account/ads/create">Upload Ad</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/account/deposit">Deposit Funds</Link>
                  </Button>
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

      <StatsCards balance={balance} loading={balanceLoading} onRefresh={refetchBalance} />

      <div className="grid gap-6 md:grid-cols-2">
        <EarningsBreakdown balance={balance} loading={balanceLoading} />
        <QuickActions />
      </div>

      <RecentTransactions transactions={transactions} loading={transactionsLoading} />

      {business && user && (
        <EditProfileSheet
          open={editSheetOpen}
          onOpenChange={setEditSheetOpen}
          profile={business}
          userId={user.uid}
          onSuccess={refreshProfile}
        />
      )}
    </div>
  )
}
