"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/providers/Auth"
import { useAds, useAdWallet } from "@/hooks/ads"
import { AdsList, AdWalletCard, AdDepositDialog } from "@/components/custom/account/ads"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AdFilterType } from "@/types/ads"

export default function AdsPage() {
    const { profile, loading: authLoading } = useAuth()
    const [filter, setFilter] = useState<AdFilterType>("all")
    const { ads, loading: adsLoading, refetch } = useAds({ filter })
    const { balance, totalDeposited, totalSpent, loading: walletLoading, refetch: refetchWallet } = useAdWallet()
    const searchParams = useSearchParams()
    const router = useRouter()

    const [depositOpen, setDepositOpen] = useState(false)

    // Open deposit dialog if URL has deposit=true
    useEffect(() => {
        if (searchParams.get("deposit") === "true") {
            setDepositOpen(true)
            // Remove the query param
            router.replace("/account/ads")
        }
    }, [searchParams, router])

    const handleDepositClose = (open: boolean) => {
        setDepositOpen(open)
        if (!open) {
            refetchWallet()
        }
    }

    const handleFilterChange = (newFilter: AdFilterType) => {
        setFilter(newFilter)
    }

    const handleUpdate = () => {
        refetch()
        refetchWallet()
    }

    if (authLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    const business = profile?.businessProfile
    const isVerified = business?.verificationStatus === "verified"

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Ads Manager</h1>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <span>{business?.businessName || "My Business"}</span>
                        {business?.verificationStatus && (
                            <Badge
                                variant={isVerified ? "default" : "secondary"}
                            >
                                {business.verificationStatus.toUpperCase()}
                            </Badge>
                        )}
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setDepositOpen(true)}
                    >
                        Deposit Funds
                    </Button>
                    <Button asChild disabled={!isVerified}>
                        <Link href="/account/ads/create">
                            <Plus className="mr-2 size-4" />
                            Create Ad
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Verification Warning */}
            {!isVerified && (
                <Alert>
                    <AlertCircle className="size-4" />
                    <AlertTitle>Account Not Verified</AlertTitle>
                    <AlertDescription>
                        Your business account must be verified before you can create ads.
                        Please complete your business profile verification.
                    </AlertDescription>
                </Alert>
            )}

            {/* Wallet Card */}
            <div className="grid gap-6 md:grid-cols-3">
                <AdWalletCard
                    balance={balance}
                    totalDeposited={totalDeposited}
                    totalSpent={totalSpent}
                    loading={walletLoading}
                />
            </div>

            {/* Ads List */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Your Ads</h2>
                    <Button variant="ghost" size="sm" onClick={() => refetch()}>
                        Refresh
                    </Button>
                </div>
                <AdsList
                    ads={ads}
                    loading={adsLoading}
                    emptyMessage="You haven't created any ads yet"
                    filter={filter}
                    onFilterChange={handleFilterChange}
                    onUpdate={handleUpdate}
                />
            </div>

            {/* Deposit Dialog */}
            <AdDepositDialog open={depositOpen} onOpenChange={handleDepositClose} />
        </div>
    )
}
