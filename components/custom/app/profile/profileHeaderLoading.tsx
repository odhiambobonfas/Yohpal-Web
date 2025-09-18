"use client"

import { Skeleton } from "@/components/ui/skeleton"

export default function PageHeaderLoading() {
  return (
    <div className="h-[40vh] bg-background flex flex-col p-2 items-center md:flex-row overflow-auto md:justify-center">
      {/* Avatar skeleton */}
      <div className="flex-shrink-0">
        <Skeleton className="w-[150px] h-[150px] rounded-full" />
      </div>

      {/* Text & stats skeleton */}
      <div className="ml-4 flex-1 min-w-0 space-y-3">
        {/* Username */}
        <Skeleton className="h-8 w-[200px]" />
        {/* Email */}
        <Skeleton className="h-6 w-[250px]" />
        {/* Bio */}
        <Skeleton className="h-6 w-[300px]" />
        {/* Phone */}
        <Skeleton className="h-6 w-[180px]" />

        {/* Stats row */}
        <div className="flex flex-row mt-4 gap-6">
          {[...Array(5)].map((unused, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <Skeleton className="h-5 w-12" />
              <Skeleton className="h-4 w-10" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
