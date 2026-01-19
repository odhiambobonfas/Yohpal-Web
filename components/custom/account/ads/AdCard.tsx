"use client"

import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Ad } from "@/types/ads"
import { AdStatusBadge } from "./AdStatusBadge"
import { Eye, MousePointer, ExternalLink } from "lucide-react"

interface AdCardProps {
    ad: Ad
}

export function AdCard({ ad }: AdCardProps) {
    const budgetUsedPercent = ad.totalBudget > 0
        ? (ad.spentAmount / ad.totalBudget) * 100
        : 0
    const remainingBudget = ad.totalBudget - ad.spentAmount

    return (
        <Card className="overflow-hidden">
            <div className="relative aspect-video">
                <Image
                    src={ad.imageUrl}
                    alt={ad.title}
                    fill
                    className="object-cover"
                />
                <div className="absolute top-2 right-2">
                    <AdStatusBadge status={ad.status} />
                </div>
            </div>
            <CardContent className="p-4 space-y-3">
                <div>
                    <h3 className="font-semibold line-clamp-1">{ad.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                        {ad.description}
                    </p>
                </div>

                <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Budget</span>
                        <span>
                            KES {remainingBudget.toLocaleString("en-KE")} / {ad.totalBudget.toLocaleString("en-KE")}
                        </span>
                    </div>
                    <Progress value={budgetUsedPercent} className="h-2" />
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <Eye className="size-3.5" />
                        <span>{Math.floor(ad.spentAmount / ad.costPerImpression).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <MousePointer className="size-3.5" />
                        <span>--</span>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="p-4 pt-0 gap-2">
                <Button variant="outline" className="flex-1" asChild>
                    <Link href={`/account/ads/${ad.id}`}>
                        View Details
                    </Link>
                </Button>
                <Button variant="ghost" size="icon" asChild>
                    <a href={ad.destinationUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="size-4" />
                    </a>
                </Button>
            </CardFooter>
        </Card>
    )
}
