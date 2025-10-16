"use client"

import AppAlert from "@/components/custom/app/AppAlert"
import { DEBUG_BUILD } from "@/constants"
import { useRouter } from "next/navigation"

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    const router = useRouter()
    const errMsg = DEBUG_BUILD
        ? `Failed with error:\n${error}`
        : "Oops! Something went wrong on our end."

    return (
        <AppAlert
            isOpen
            type="error"
            title="Something went wrong"
            description={errMsg}
            showCancel
            cancelText="Back"
            onClose={router.back}
            actionText="Retry"
            onAction={reset}
        />
    )
}
