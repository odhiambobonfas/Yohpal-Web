"use client"
import AppAlert from "@/components/custom/app/AppAlert"
import { useRouter } from "next/navigation"

interface AuthPromptProps {
    open: boolean
    closePrompt: () => void
}

export default function InteractionsLoginPrompt({ open, closePrompt }: AuthPromptProps) {
    const router = useRouter()

    return (
        <AppAlert
            isOpen={open}
            type="info"
            title="Login required"
            description="You need to be logged in to perform this action"
            showCancel
            cancelText="Keep watching"
            onClose={closePrompt}
            actionText="Login"
            onAction={() => router.push("/auth/login")}
        />
    )
}
