"use client"

import { Skeleton } from "@/components/ui/skeleton"

export default function ProfileHeaderLoading() {
    return (
        <div className="min-h-[40vh] flex flex-col p-2 items-center md:flex-row overflow-auto md:justify-center">
            <div className="flex-shrink-0">
                <Skeleton className="size-50 rounded-full" />
            </div>

            <div className="ml-4 flex-1 mt-4 flex flex-col items-center md:items-start space-y-3 gap-2">
                <Skeleton className="h-8 w-44" />
                <Skeleton className="h-18 w-full max-w-md" />

                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                    {Array(5)
                        .fill(0)
                        .map((__unused, i) => (
                            <div key={i} className="flex flex-col items-center justify-center">
                                <Skeleton className="h-10 w-16" />
                            </div>
                        ))}
                </div>
            </div>
        </div>
    )
}
