"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useAuth } from "@/providers/Auth"
import { useAdWallet } from "@/hooks/ads"
import { PromotionsList } from "@/components/custom/account/promotions"
import { AdWalletCard, AdDepositDialog } from "@/components/custom/account/ads"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export default function PromotionsPage() {
    const { loading: authLoading } = useAuth()
    const { balance, totalDeposited, totalSpent, loading: walletLoading, refetch: refetchWallet } = useAdWallet()
    const searchParams = useSearchParams()
    const router = useRouter()

    const [depositOpen, setDepositOpen] = useState(false)

    // Open deposit dialog if URL has deposit=true
    useEffect(() => {
        if (searchParams.get("deposit") === "true") {
            setDepositOpen(true)
            router.replace("/account/promotions")
        }
    }, [searchParams, router])

    const handleDepositClose = (open: boolean) => {
        setDepositOpen(open)
        if (!open) {
            refetchWallet()
        }
    }

    if (authLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Video Promotions</h1>
                    <p className="text-muted-foreground">
                        Promote your videos to reach more viewers
                    </p>
                </div>
                <Button
                    variant="outline"
                    onClick={() => setDepositOpen(true)}
                    className="w-full sm:w-auto"
                >
                    Deposit Funds
                </Button>
            </div>

            {/* Wallet Card */}
            <div className="grid gap-6 md:grid-cols-3">
                <AdWalletCard
                    balance={balance}
                    totalDeposited={totalDeposited}
                    totalSpent={totalSpent}
                    loading={walletLoading}
                />
            </div>

            {/* Promotions List */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Your Promotions</h2>
                </div>
                <PromotionsList />
            </div>

            {/* Deposit Dialog */}
            <AdDepositDialog open={depositOpen} onOpenChange={handleDepositClose} />
        </div>
    )
}
