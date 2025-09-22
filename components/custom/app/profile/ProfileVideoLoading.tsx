"use client"

import { Skeleton } from "@/components/ui/skeleton"

export default function ProfileVideoLoading() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {Array(10)
                .fill(0)
                .map((__, idx) => (
                    <Skeleton key={idx} className="h-80 col-span-1" />
                ))}
        </div>
    )
}