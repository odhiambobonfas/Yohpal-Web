"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { useAd, useUpdateAd, useAdWallet } from "@/hooks/ads"
import { AdStatusBadge, PublishAdDialog, RepublishAdDialog } from "@/components/custom/account/ads"
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
    Repeat,
} from "lucide-react"
import { AD_VIEW_FREQUENCY_OPTIONS, AD_DEFAULT_VIEW_FREQUENCY } from "@/constants"
import { getRemainingBudget, formatAdTime, calculateTimeDelivered, calculateSpentAmount } from "@/lib/ads/calculations"

export default function AdDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const adId = params.adId as string

    const { ad, loading, refetch } = useAd(adId)
    const { deleteAd, loading: deleting } = useUpdateAd()
    const { refetch: refetchWallet } = useAdWallet()
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [publishDialogOpen, setPublishDialogOpen] = useState(false)
    const [republishDialogOpen, setRepublishDialogOpen] = useState(false)

    const handleDelete = async () => {
        try {
            await deleteAd(adId)
            toast.success("Ad deleted successfully")
            router.push("/account/ads")
        } catch {
            toast.error("Failed to delete ad")
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

    if (!ad) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
                <p className="text-muted-foreground">Ad not found</p>
                <Button asChild>
                    <Link href="/account/ads">Back to Ads</Link>
                </Button>
            </div>
        )
    }

    const remainingBudget = getRemainingBudget(ad.amountAllocated, ad.viewsGenerated)
    const spentAmount = calculateSpentAmount(ad.viewsGenerated)
    const budgetUsedPercent = ad.amountAllocated > 0
        ? (spentAmount / ad.amountAllocated) * 100
        : 0
    const timeDelivered = calculateTimeDelivered(ad.viewsGenerated)

    const isDraft = !ad.isPublished
    const isDepleted = ad.isDepleted

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/account/ads">
                            <ArrowLeft className="size-4" />
                        </Link>
                    </Button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold tracking-tight">Ad Details</h1>
                            <AdStatusBadge
                                isPublished={ad.isPublished}
                                isDepleted={ad.isDepleted}
                            />
                        </div>
                        <p className="text-muted-foreground">
                            Created {typeof ad.createdAt === "string"
                                ? new Date(ad.createdAt).toLocaleDateString()
                                : new Date(ad.createdAt.seconds * 1000).toLocaleDateString()}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {isDraft && (
                        <Button onClick={() => setPublishDialogOpen(true)}>
                            <Rocket className="mr-2 size-4" />
                            Publish
                        </Button>
                    )}
                    {isDepleted && (
                        <Button onClick={() => setRepublishDialogOpen(true)}>
                            <RefreshCw className="mr-2 size-4" />
                            Republish
                        </Button>
                    )}
                    <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive">
                                <Trash2 className="mr-2 size-4" />
                                Delete
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete Ad?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. The ad will be permanently deleted
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
                            <p className="text-2xl font-bold">{ad.viewsGenerated.toLocaleString()}</p>
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

            {/* Ad Details */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Preview */}
                <Card className="overflow-hidden">
                    <div className="relative aspect-video">
                        <Image
                            src={ad.imageUrl}
                            alt={ad.description || "Ad image"}
                            fill
                            className="object-cover"
                        />
                    </div>
                    {ad.description && (
                        <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">{ad.description}</p>
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
                            {ad.amountAllocated > 0 ? (
                                <>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Spent</span>
                                            <span>
                                                KES {spentAmount.toLocaleString("en-KE")} / {ad.amountAllocated.toLocaleString("en-KE")}
                                            </span>
                                        </div>
                                        <Progress value={budgetUsedPercent} className="h-2" />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-2">
                                        <div>
                                            <p className="text-xs text-muted-foreground">Total Allocated</p>
                                            <p className="font-semibold">
                                                KES {ad.amountAllocated.toLocaleString("en-KE")}
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
                                        No budget allocated yet. Publish this ad to start showing it to viewers.
                                    </p>
                                    <Button onClick={() => setPublishDialogOpen(true)}>
                                        <Rocket className="mr-2 size-4" />
                                        Publish Ad
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
                                    {AD_VIEW_FREQUENCY_OPTIONS.find(o => o.value === (ad.viewFrequency ?? AD_DEFAULT_VIEW_FREQUENCY))?.label ?? "Once per day"}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">View Duration</p>
                                <p className="font-medium">15 seconds per view</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Created</p>
                                <p className="font-medium">
                                    {typeof ad.createdAt === "string"
                                        ? new Date(ad.createdAt).toLocaleString()
                                        : new Date(ad.createdAt.seconds * 1000).toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Last Updated</p>
                                <p className="font-medium">
                                    {typeof ad.updatedAt === "string"
                                        ? new Date(ad.updatedAt).toLocaleString()
                                        : new Date(ad.updatedAt.seconds * 1000).toLocaleString()}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Dialogs */}
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
        </div>
    )
}
