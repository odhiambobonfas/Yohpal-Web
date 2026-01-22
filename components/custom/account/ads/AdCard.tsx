"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Ad } from "@/types/ads"
import { AdStatusBadge } from "./AdStatusBadge"
import { PublishAdDialog } from "./PublishAdDialog"
import { RepublishAdDialog } from "./RepublishAdDialog"
import { Eye, Clock, Rocket, RefreshCw } from "lucide-react"
import { getRemainingBudget, formatAdTime, calculateTimeDelivered, calculateSpentAmount } from "@/lib/ads/calculations"

interface AdCardProps {
    ad: Ad
    onUpdate?: () => void
}

export function AdCard({ ad, onUpdate }: AdCardProps) {
    const [publishDialogOpen, setPublishDialogOpen] = useState(false)
    const [republishDialogOpen, setRepublishDialogOpen] = useState(false)

    const remainingBudget = getRemainingBudget(ad.amountAllocated, ad.viewsGenerated)
    const spentAmount = calculateSpentAmount(ad.viewsGenerated)
    const budgetUsedPercent = ad.amountAllocated > 0
        ? (spentAmount / ad.amountAllocated) * 100
        : 0
    const timeDelivered = calculateTimeDelivered(ad.viewsGenerated)

    const isDraft = !ad.isPublished
    const isDepleted = ad.isDepleted
    const isActive = ad.isPublished && !ad.isDepleted

    const handleSuccess = () => {
        onUpdate?.()
    }

    return (
        <>
            <Card className="overflow-hidden">
                <div className="relative aspect-video">
                    <Image
                        src={ad.imageUrl}
                        alt={ad.description || "Ad image"}
                        fill
                        className="object-cover"
                    />
                    <div className="absolute top-2 right-2">
                        <AdStatusBadge
                            isPublished={ad.isPublished}
                            isDepleted={ad.isDepleted}
                        />
                    </div>
                </div>
                <CardContent className="p-4 space-y-3">
                    {ad.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                            {ad.description}
                        </p>
                    )}

                    {ad.amountAllocated > 0 && (
                        <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Budget</span>
                                <span>
                                    KES {remainingBudget.toLocaleString("en-KE")} / {ad.amountAllocated.toLocaleString("en-KE")}
                                </span>
                            </div>
                            <Progress value={budgetUsedPercent} className="h-2" />
                        </div>
                    )}

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <Eye className="size-3.5" />
                            <span>{ad.viewsGenerated.toLocaleString()} views</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Clock className="size-3.5" />
                            <span>{formatAdTime(timeDelivered)}</span>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="p-4 pt-0 gap-2">
                    <Button variant="outline" className="flex-1" asChild>
                        <Link href={`/account/ads/${ad.id}`}>
                            View Details
                        </Link>
                    </Button>
                    {isDraft && (
                        <Button
                            variant="default"
                            size="icon"
                            onClick={() => setPublishDialogOpen(true)}
                            title="Publish Ad"
                        >
                            <Rocket className="size-4" />
                        </Button>
                    )}
                    {isDepleted && (
                        <Button
                            variant="default"
                            size="icon"
                            onClick={() => setRepublishDialogOpen(true)}
                            title="Republish Ad"
                        >
                            <RefreshCw className="size-4" />
                        </Button>
                    )}
                </CardFooter>
            </Card>

            <PublishAdDialog
                ad={ad}
                open={publishDialogOpen}
                onOpenChange={setPublishDialogOpen}
                onSuccess={handleSuccess}
            />

            <RepublishAdDialog
                ad={ad}
                open={republishDialogOpen}
                onOpenChange={setRepublishDialogOpen}
                onSuccess={handleSuccess}
            />
        </>
    )
}
