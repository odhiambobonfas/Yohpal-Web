"use client"

import AppAlert from "@/components/custom/app/AppAlert"
import { useRouter } from "next/navigation"

export default function NotLoggedIn() {
    const router = useRouter()

    return (
        <AppAlert
            isOpen
            type="info"
            title="Logged Out"
            description="We can't show you your following feed just yet"
            cancelText="Go back"
            onClose={router.back}
            actionText="Login"
            onAction={() => router.push("/auth/login")}
        />
    )
}
