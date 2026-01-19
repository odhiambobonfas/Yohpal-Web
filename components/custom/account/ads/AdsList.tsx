"use client"

import { Ad } from "@/types/ads"
import { AdCard } from "./AdCard"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { Megaphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface AdsListProps {
    ads: Ad[]
    loading?: boolean
    emptyMessage?: string
}

export function AdsList({ ads, loading, emptyMessage = "No ads yet" }: AdsListProps) {
    if (loading) {
        return (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((unused, i) => (
                    <Card key={i} className="overflow-hidden">
                        <Skeleton className="aspect-video" />
                        <CardContent className="p-4 space-y-3">
                            <Skeleton className="h-5 w-3/4" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-2 w-full" />
                            <div className="flex gap-4">
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-4 w-16" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }

    if (ads.length === 0) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="rounded-full bg-muted p-4 mb-4">
                        <Megaphone className="size-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold mb-1">{emptyMessage}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        Create your first ad to start reaching your audience
                    </p>
                    <Button asChild>
                        <Link href="/account/ads/create">Create Ad</Link>
                    </Button>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ads.map((ad) => (
                <AdCard key={ad.id} ad={ad} />
            ))}
        </div>
    )
}
