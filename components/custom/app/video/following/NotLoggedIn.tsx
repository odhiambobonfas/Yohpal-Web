"use client"

import AppAlert from "@/components/custom/app/AppAlert"
import { useAuth } from "@/providers/Auth"
import { useRouter } from "next/navigation"

export default function NotLoggedIn() {
    const { isAuthenticated } = useAuth()
    const router = useRouter()
    return (
        <AppAlert
            isOpen={!isAuthenticated}
            type="info"
            title="Logged Out"
            description="We can't show you your following feed just yet"
            showCancel
            cancelText="Back to feed"
            actionText="Login"
            onAction={() => router.push("/auth/login")}
            onClose={() => router.push("/")}
        />
    )
}
