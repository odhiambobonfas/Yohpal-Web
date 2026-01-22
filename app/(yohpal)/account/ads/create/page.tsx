"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/providers/Auth"
import { CreateAdForm } from "@/components/custom/account/ads"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function CreateAdPage() {
    const { profile, loading: authLoading } = useAuth()
    const router = useRouter()

    const business = profile?.businessProfile
    const isVerified = business?.verificationStatus === "verified"

    useEffect(() => {
        if (!authLoading) {
            if (!isVerified) {
                router.push("/account/ads")
            }
        }
    }, [authLoading, isVerified, router])

    if (authLoading) {
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
                        Create an ad draft, then publish when ready
                    </p>
                </div>
            </div>

            {/* Info about drafts */}
            <Alert>
                <AlertCircle className="size-4" />
                <AlertTitle>How it works</AlertTitle>
                <AlertDescription>
                    Your ad will be saved as a draft. You can publish it anytime once you have funds in your wallet.
                    Minimum KES 20 to publish.
                </AlertDescription>
            </Alert>

            {/* Create Form */}
            <CreateAdForm />
        </div>
    )
}
