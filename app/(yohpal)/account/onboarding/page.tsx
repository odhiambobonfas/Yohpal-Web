"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/providers/Auth"
import { OnboardingWizard } from "@/components/custom/account/onboarding"
import { Loader2 } from "lucide-react"

export default function OnboardingPage() {
    const { profile, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        // Redirect to account if user already has a business profile
        if (!loading && profile?.businessProfile?.businessName) {
            router.replace("/account")
        }
    }, [profile, loading, router])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100svh-4rem)]">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    // If user already has a business profile, show loading while redirecting
    if (profile?.businessProfile?.businessName) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100svh-4rem)]">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return <OnboardingWizard />
}
