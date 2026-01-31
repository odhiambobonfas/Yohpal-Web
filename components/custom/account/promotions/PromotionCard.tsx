"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { VideoPromotion } from "@/types/ads"
import { PromotionStatusBadge } from "./PromotionStatusBadge"
import { PublishPromotionDialog } from "./PublishPromotionDialog"
import { RepublishPromotionDialog } from "./RepublishPromotionDialog"
import { Eye, Clock, Rocket, RefreshCw, Repeat, PlayCircle } from "lucide-react"
import { getRemainingBudget, formatAdTime, calculateTimeDelivered, calculateSpentAmount } from "@/lib/ads/calculations"
import { AD_DEFAULT_VIEW_FREQUENCY } from "@/constants"

interface PromotionCardProps {
    promotion: VideoPromotion
    onUpdate?: () => void
}

export function PromotionCard({ promotion, onUpdate }: PromotionCardProps) {
    const [publishDialogOpen, setPublishDialogOpen] = useState(false)
    const [republishDialogOpen, setRepublishDialogOpen] = useState(false)

    const remainingBudget = getRemainingBudget(promotion.amountAllocated, promotion.viewsGenerated)
    const spentAmount = calculateSpentAmount(promotion.viewsGenerated)
    const budgetUsedPercent = promotion.amountAllocated > 0
        ? (spentAmount / promotion.amountAllocated) * 100
        : 0
    const timeDelivered = calculateTimeDelivered(promotion.viewsGenerated)

    const isDraft = !promotion.isPublished
    const isDepleted = promotion.isDepleted

    const handleSuccess = () => {
        onUpdate?.()
    }

    return (
        <>
            <Card className="overflow-hidden">
                <div className="relative aspect-video bg-muted">
                    {promotion.videoThumbnail ? (
                        <Image
                            src={promotion.videoThumbnail}
                            alt={promotion.videoTitle || "Video thumbnail"}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <PlayCircle className="size-12 text-muted-foreground" />
                        </div>
                    )}
                    <div className="absolute top-2 right-2">
                        <PromotionStatusBadge
                            isPublished={promotion.isPublished}
                            isDepleted={promotion.isDepleted}
                        />
                    </div>
                </div>
                <CardContent className="p-4 space-y-3">
                    {promotion.videoTitle && (
                        <p className="text-sm font-medium line-clamp-2">
                            {promotion.videoTitle}
                        </p>
                    )}

                    {promotion.amountAllocated > 0 && (
                        <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Budget</span>
                                <span>
                                    KES {remainingBudget.toLocaleString("en-KE")} / {promotion.amountAllocated.toLocaleString("en-KE")}
                                </span>
                            </div>
                            <Progress value={budgetUsedPercent} className="h-2" />
                        </div>
                    )}

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <Eye className="size-3.5" />
                            <span>{promotion.viewsGenerated.toLocaleString()} views</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Clock className="size-3.5" />
                            <span>{formatAdTime(timeDelivered)}</span>
                        </div>
                        {(promotion.viewFrequency ?? AD_DEFAULT_VIEW_FREQUENCY) > 1 && (
                            <div className="flex items-center gap-1">
                                <Repeat className="size-3.5" />
                                <span>{promotion.viewFrequency}x/day</span>
                            </div>
                        )}
                    </div>
                </CardContent>
                <CardFooter className="p-4 pt-0 gap-2">
                    <Button variant="outline" className="flex-1" asChild>
                        <Link href={`/account/promotions/${promotion.id}`}>
                            View Details
                        </Link>
                    </Button>
                    {isDraft && (
                        <Button
                            variant="default"
                            size="icon"
                            onClick={() => setPublishDialogOpen(true)}
                            title="Publish Promotion"
                        >
                            <Rocket className="size-4" />
                        </Button>
                    )}
                    {isDepleted && (
                        <Button
                            variant="default"
                            size="icon"
                            onClick={() => setRepublishDialogOpen(true)}
                            title="Republish Promotion"
                        >
                            <RefreshCw className="size-4" />
                        </Button>
                    )}
                </CardFooter>
            </Card>

            <PublishPromotionDialog
                promotion={promotion}
                open={publishDialogOpen}
                onOpenChange={setPublishDialogOpen}
                onSuccess={handleSuccess}
            />

            <RepublishPromotionDialog
                promotion={promotion}
                open={republishDialogOpen}
                onOpenChange={setRepublishDialogOpen}
                onSuccess={handleSuccess}
            />
        </>
    )
}
