"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/providers/Auth"
import { useAdWallet } from "@/hooks/ads"
import { CreateAdForm } from "@/components/custom/account/ads"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function CreateAdPage() {
    const { profile, loading: authLoading } = useAuth()
    const { balance, loading: walletLoading } = useAdWallet()
    const router = useRouter()

    const business = profile?.businessProfile
    const isVerified = business?.verificationStatus === "verified"
    const canCreateAd = isVerified && balance > 0

    useEffect(() => {
        if (!authLoading && !walletLoading) {
            if (!isVerified) {
                router.push("/account/ads")
            }
        }
    }, [authLoading, walletLoading, isVerified, router])

    if (authLoading || walletLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (!isVerified) {
        return null // Will redirect
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/account/ads">
                        <ArrowLeft className="size-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Create New Ad</h1>
                    <p className="text-muted-foreground">
                        Create an advertisement to reach your target audience
                    </p>
                </div>
            </div>

            {/* Balance Warning */}
            {balance <= 0 && (
                <Alert variant="destructive">
                    <AlertCircle className="size-4" />
                    <AlertTitle>Insufficient Balance</AlertTitle>
                    <AlertDescription>
                        You need to deposit funds to your ad wallet before creating ads.
                        <Button variant="link" className="h-auto p-0 ml-1" asChild>
                            <Link href="/account/ads?deposit=true">Deposit now</Link>
                        </Button>
                    </AlertDescription>
                </Alert>
            )}

            {/* Create Form */}
            {canCreateAd ? (
                <CreateAdForm />
            ) : (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">
                        Please deposit funds to your ad wallet to create ads.
                    </p>
                    <Button className="mt-4" asChild>
                        <Link href="/account/ads?deposit=true">Deposit Funds</Link>
                    </Button>
                </div>
            )}
        </div>
    )
}
