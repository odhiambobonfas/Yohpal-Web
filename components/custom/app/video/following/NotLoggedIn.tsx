"use client"

import AppAlert from "@/components/custom/app/AppAlert"
import { useEmailAuth } from "@/hooks/auth/use-email-auth"
import { useRouter } from "next/navigation"

export default function NotLoggedIn() {
    const { logOut } = useEmailAuth()
    const router = useRouter()

    const handleLoginAction = async () => {
        await logOut()
        router.push("/auth/login")
    }

    return (
        <AppAlert
            isOpen
            type="info"
            title="Logged Out"
            description="We can't show you your following feed just yet"
            cancelText="Go back"
            onClose={router.back}
            actionText="Login"
            onAction={handleLoginAction}
        />
    )
}
