"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { usePromotion, useDeletePromotion } from "@/hooks/promotions"
import { useAdWallet } from "@/hooks/ads"
import { PromotionStatusBadge, PublishPromotionDialog, RepublishPromotionDialog } from "@/components/custom/account/promotions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import {
    Loader2,
    ArrowLeft,
    Trash2,
    Rocket,
    RefreshCw,
    Eye,
    Clock,
    Coins,
    PlayCircle,
    Repeat,
} from "lucide-react"
import { getRemainingBudget, formatAdTime, calculateTimeDelivered, calculateSpentAmount } from "@/lib/ads/calculations"
import { AD_VIEW_FREQUENCY_OPTIONS, AD_DEFAULT_VIEW_FREQUENCY } from "@/constants"

export default function PromotionDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const promotionId = params.promotionId as string

    const { promotion, loading, refetch } = usePromotion(promotionId)
    const { deletePromotion, loading: deleting } = useDeletePromotion()
    const { refetch: refetchWallet } = useAdWallet()
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [publishDialogOpen, setPublishDialogOpen] = useState(false)
    const [republishDialogOpen, setRepublishDialogOpen] = useState(false)

    const handleDelete = async () => {
        try {
            const result = await deletePromotion(promotionId)
            if (result?.refunded && result.refunded > 0) {
                toast.success(`Promotion deleted. KES ${result.refunded.toFixed(2)} refunded to your wallet.`)
            } else {
                toast.success("Promotion deleted successfully")
            }
            router.push("/account/promotions")
        } catch {
            toast.error("Failed to delete promotion")
        }
    }

    const handleSuccess = () => {
        refetch()
        refetchWallet()
    }

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (!promotion) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
                <p className="text-muted-foreground">Promotion not found</p>
                <Button asChild>
                    <Link href="/account/promotions">Back to Promotions</Link>
                </Button>
            </div>
        )
    }

    const remainingBudget = getRemainingBudget(promotion.amountAllocated, promotion.viewsGenerated)
    const spentAmount = calculateSpentAmount(promotion.viewsGenerated)
    const budgetUsedPercent = promotion.amountAllocated > 0
        ? (spentAmount / promotion.amountAllocated) * 100
        : 0
    const timeDelivered = calculateTimeDelivered(promotion.viewsGenerated)

    const isDraft = !promotion.isPublished
    const isDepleted = promotion.isDepleted

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/account/promotions">
                            <ArrowLeft className="size-4" />
                        </Link>
                    </Button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold tracking-tight">Promotion Details</h1>
                            <PromotionStatusBadge
                                isPublished={promotion.isPublished}
                                isDepleted={promotion.isDepleted}
                            />
                        </div>
                        <p className="text-muted-foreground">
                            Created {typeof promotion.createdAt === "string"
                                ? new Date(promotion.createdAt).toLocaleDateString()
                                : new Date(promotion.createdAt.seconds * 1000).toLocaleDateString()}
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    {isDraft && (
                        <Button onClick={() => setPublishDialogOpen(true)} className="w-full sm:w-auto">
                            <Rocket className="mr-2 size-4" />
                            Publish
                        </Button>
                    )}
                    {isDepleted && (
                        <Button onClick={() => setRepublishDialogOpen(true)} className="w-full sm:w-auto">
                            <RefreshCw className="mr-2 size-4" />
                            Republish
                        </Button>
                    )}
                    <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" disabled={promotion.isPublished && !promotion.isDepleted} className="w-full sm:w-auto">
                                <Trash2 className="mr-2 size-4" />
                                Delete
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete Promotion?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. The promotion will be permanently deleted
                                    {remainingBudget > 0 && ` and KES ${remainingBudget.toFixed(2)} will be refunded to your wallet.`}
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete} disabled={deleting}>
                                    {deleting ? "Deleting..." : "Delete"}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardContent className="flex items-center gap-4 p-6">
                        <div className="rounded-full bg-primary/10 p-3">
                            <Eye className="size-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Views</p>
                            <p className="text-2xl font-bold">{promotion.viewsGenerated.toLocaleString()}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center gap-4 p-6">
                        <div className="rounded-full bg-primary/10 p-3">
                            <Clock className="size-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Time Delivered</p>
                            <p className="text-2xl font-bold">{formatAdTime(timeDelivered)}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center gap-4 p-6">
                        <div className="rounded-full bg-primary/10 p-3">
                            <Coins className="size-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Amount Spent</p>
                            <p className="text-2xl font-bold">KES {spentAmount.toLocaleString("en-KE")}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Promotion Details */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Video Preview */}
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
                                <PlayCircle className="size-16 text-muted-foreground" />
                            </div>
                        )}
                    </div>
                    {promotion.videoTitle && (
                        <CardContent className="p-4">
                            <p className="font-medium">{promotion.videoTitle}</p>
                        </CardContent>
                    )}
                </Card>

                {/* Budget Details */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Budget</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {promotion.amountAllocated > 0 ? (
                                <>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Spent</span>
                                            <span>
                                                KES {spentAmount.toLocaleString("en-KE")} / {promotion.amountAllocated.toLocaleString("en-KE")}
                                            </span>
                                        </div>
                                        <Progress value={budgetUsedPercent} className="h-2" />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                        <div>
                                            <p className="text-xs text-muted-foreground">Total Allocated</p>
                                            <p className="font-semibold">
                                                KES {promotion.amountAllocated.toLocaleString("en-KE")}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Remaining</p>
                                            <p className="font-semibold">
                                                KES {remainingBudget.toLocaleString("en-KE")}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Cost per View</p>
                                            <p className="font-semibold">KES 1.00</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Est. Views Left</p>
                                            <p className="font-semibold">
                                                {remainingBudget.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-4">
                                    <p className="text-muted-foreground mb-4">
                                        No budget allocated yet. Publish this promotion to start showing it to viewers.
                                    </p>
                                    <Button onClick={() => setPublishDialogOpen(true)}>
                                        <Rocket className="mr-2 size-4" />
                                        Publish Promotion
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Info Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Info</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <p className="text-xs text-muted-foreground">View Frequency</p>
                                <p className="font-medium flex items-center gap-1.5">
                                    <Repeat className="size-3.5 text-muted-foreground" />
                                    {AD_VIEW_FREQUENCY_OPTIONS.find(o => o.value === (promotion.viewFrequency ?? AD_DEFAULT_VIEW_FREQUENCY))?.label ?? "Once per day"}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">View Duration</p>
                                <p className="font-medium">15 seconds per view</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Created</p>
                                <p className="font-medium">
                                    {typeof promotion.createdAt === "string"
                                        ? new Date(promotion.createdAt).toLocaleString()
                                        : new Date(promotion.createdAt.seconds * 1000).toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Last Updated</p>
                                <p className="font-medium">
                                    {typeof promotion.updatedAt === "string"
                                        ? new Date(promotion.updatedAt).toLocaleString()
                                        : new Date(promotion.updatedAt.seconds * 1000).toLocaleString()}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Dialogs */}
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
        </div>
    )
}
