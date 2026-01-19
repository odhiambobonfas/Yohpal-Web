"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { useAd, useUpdateAd } from "@/hooks/ads"
import { AdStatusBadge, AdStatsCard } from "@/components/custom/account/ads"
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
    ExternalLink,
    Play,
    Pause,
    Trash2,
} from "lucide-react"

export default function AdDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const adId = params.adId as string

    const { ad, loading, refetch } = useAd(adId)
    const { updateAd, deleteAd, loading: updating } = useUpdateAd()
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

    const handleToggleStatus = async () => {
        if (!ad) return

        const newStatus = ad.status === "active" ? "paused" : "active"

        try {
            await updateAd(adId, { status: newStatus })
            toast.success(`Ad ${newStatus === "active" ? "resumed" : "paused"} successfully`)
            refetch()
        } catch {
            toast.error("Failed to update ad status")
        }
    }

    const handleDelete = async () => {
        try {
            await deleteAd(adId)
            toast.success("Ad deleted successfully")
            router.push("/account/ads")
        } catch {
            toast.error("Failed to delete ad")
        }
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

    const budgetUsedPercent = ad.totalBudget > 0
        ? (ad.spentAmount / ad.totalBudget) * 100
        : 0
    const remainingBudget = ad.totalBudget - ad.spentAmount
    const canToggleStatus = ad.status === "active" || ad.status === "paused"

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
                            <h1 className="text-2xl font-bold tracking-tight">{ad.title}</h1>
                            <AdStatusBadge status={ad.status} />
                        </div>
                        <p className="text-muted-foreground">{ad.businessName}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {canToggleStatus && (
                        <Button
                            variant="outline"
                            onClick={handleToggleStatus}
                            disabled={updating}
                        >
                            {updating ? (
                                <Loader2 className="mr-2 size-4 animate-spin" />
                            ) : ad.status === "active" ? (
                                <Pause className="mr-2 size-4" />
                            ) : (
                                <Play className="mr-2 size-4" />
                            )}
                            {ad.status === "active" ? "Pause" : "Resume"}
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
                                    and any remaining budget will be returned to your wallet.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete}>
                                    Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>

            {/* Stats */}
            <AdStatsCard
                impressions={ad.stats?.impressions ?? 0}
                clicks={ad.stats?.clicks ?? 0}
                ctr={ad.stats?.ctr ?? 0}
                totalSpent={ad.stats?.totalSpent ?? ad.spentAmount}
                loading={false}
            />

            {/* Ad Details */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Preview */}
                <Card className="overflow-hidden">
                    <div className="relative aspect-video">
                        <Image
                            src={ad.imageUrl}
                            alt={ad.title}
                            fill
                            className="object-cover"
                        />
                    </div>
                    <CardContent className="p-4 space-y-3">
                        <div>
                            <h3 className="font-semibold">{ad.title}</h3>
                            <p className="text-sm text-muted-foreground">{ad.description}</p>
                        </div>
                        <Button className="w-full" asChild>
                            <a href={ad.destinationUrl} target="_blank" rel="noopener noreferrer">
                                {ad.callToAction}
                                <ExternalLink className="ml-2 size-4" />
                            </a>
                        </Button>
                    </CardContent>
                </Card>

                {/* Details */}
                <div className="space-y-6">
                    {/* Budget */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Budget</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Spent</span>
                                    <span>
                                        KES {ad.spentAmount.toLocaleString("en-KE")} / {ad.totalBudget.toLocaleString("en-KE")}
                                    </span>
                                </div>
                                <Progress value={budgetUsedPercent} className="h-2" />
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div>
                                    <p className="text-xs text-muted-foreground">Total Budget</p>
                                    <p className="font-semibold">
                                        KES {ad.totalBudget.toLocaleString("en-KE")}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Remaining</p>
                                    <p className="font-semibold">
                                        KES {remainingBudget.toLocaleString("en-KE")}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Cost per Impression</p>
                                    <p className="font-semibold">
                                        KES {ad.costPerImpression.toFixed(2)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Est. Impressions Left</p>
                                    <p className="font-semibold">
                                        {Math.floor(remainingBudget / ad.costPerImpression).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <p className="text-xs text-muted-foreground">Call to Action</p>
                                <p className="font-medium">{ad.callToAction}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Destination URL</p>
                                <a
                                    href={ad.destinationUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-medium text-primary hover:underline break-all"
                                >
                                    {ad.destinationUrl}
                                </a>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Created</p>
                                <p className="font-medium">
                                    {typeof ad.createdAt === "string"
                                        ? new Date(ad.createdAt).toLocaleDateString()
                                        : new Date(ad.createdAt.seconds * 1000).toLocaleDateString()}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
