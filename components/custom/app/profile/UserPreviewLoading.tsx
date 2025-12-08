import { Skeleton } from "@/components/ui/skeleton"

export function UserPreviewSkeleton() {
    return (
        <div className="flex items-center space-x-4 p-2">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[80%]" />
            </div>
        </div>
    )
}
