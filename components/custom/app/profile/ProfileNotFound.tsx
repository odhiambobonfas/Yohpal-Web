"use client"

import AppAlert from "@/components/custom/app/AppAlert"
import ProfileHeaderLoading from "@/components/custom/app/profile/ProfileHeaderLoading"
import ProfileVideoLoading from "@/components/custom/app/profile/ProfileVideoLoading"
import { useRouter } from "next/navigation"

export default function ProfileNotFound() {
    const router = useRouter()

    return (
        <>
            <ProfileHeaderLoading />
            <div className="px-2">
                <ProfileVideoLoading />
            </div>
            <AppAlert
                type="warn"
                isOpen
                title="User not found"
                actionText="Back home"
                onAction={router.back}
            />
        </>
    )
}
