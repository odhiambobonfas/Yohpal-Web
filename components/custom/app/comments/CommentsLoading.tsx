import { Skeleton } from "@/components/ui/skeleton"

export default function CommentsLoading() {
    return (
        <div className="inline-flex gap-2 w-full">
            <Skeleton className="size-10 rounded-full" />
            <div className="flex flex-col gap-2 w-full h-24">
                <Skeleton className="w-2/6 rounded-lg h-6" />
                <Skeleton className="w-full rounded-lg h-10" />
            </div>
        </div>
    )
}
