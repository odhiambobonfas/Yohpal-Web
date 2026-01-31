"use client"

import { useState } from "react"
import Image from "next/image"
import { usePublishPromotion } from "@/hooks/promotions"
import { useAdWallet } from "@/hooks/ads"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2, Rocket, PlayCircle } from "lucide-react"
import { ViewCalculator } from "../ads/ViewCalculator"
import { VideoPromotion, AdViewFrequency } from "@/types/ads"
import { AD_MIN_PUBLISH_AMOUNT, AD_VIEW_FREQUENCY_OPTIONS, AD_DEFAULT_VIEW_FREQUENCY } from "@/constants"

interface PublishPromotionDialogProps {
    promotion: VideoPromotion
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export function PublishPromotionDialog({ promotion, open, onOpenChange, onSuccess }: PublishPromotionDialogProps) {
    const { publishPromotion, loading, reset } = usePublishPromotion()
    const { balance, refetch: refetchWallet } = useAdWallet()
    const [amount, setAmount] = useState("")
    const [viewFrequency, setViewFrequency] = useState<AdViewFrequency>(AD_DEFAULT_VIEW_FREQUENCY as AdViewFrequency)

    const amountValue = parseFloat(amount) || 0
    const isValidAmount = amountValue >= AD_MIN_PUBLISH_AMOUNT
    const hasEnoughBalance = balance >= amountValue

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!isValidAmount) {
            toast.error(`Minimum amount is KES ${AD_MIN_PUBLISH_AMOUNT}`)
            return
        }

        if (!hasEnoughBalance) {
            toast.error("Insufficient wallet balance")
            return
        }

        try {
            await publishPromotion(promotion.id, amountValue, viewFrequency)
            toast.success("Promotion published successfully!")
            refetchWallet()
            onSuccess?.()
            handleClose()
        } catch {
            toast.error("Failed to publish promotion")
        }
    }

    const handleClose = () => {
        reset()
        setAmount("")
        setViewFrequency(AD_DEFAULT_VIEW_FREQUENCY as AdViewFrequency)
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Rocket className="size-5" />
                        Publish Promotion
                    </DialogTitle>
                    <DialogDescription>
                        Set your budget to start promoting this video to viewers
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="rounded-lg border p-3">
                        <p className="text-xs text-muted-foreground mb-2">Video Preview</p>
                        <div className="flex items-center gap-3">
                            <div className="relative w-24 aspect-video rounded overflow-hidden bg-muted shrink-0">
                                {promotion.videoThumbnail ? (
                                    <Image
                                        src={promotion.videoThumbnail}
                                        alt={promotion.videoTitle || "Video"}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <PlayCircle className="size-6 text-muted-foreground" />
                                    </div>
                                )}
                            </div>
                            <p className="text-sm font-medium line-clamp-2">{promotion.videoTitle}</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="amount">Budget Amount (KES)</Label>
                        <Input
                            id="amount"
                            type="number"
                            placeholder={`Minimum KES ${AD_MIN_PUBLISH_AMOUNT}`}
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            min={AD_MIN_PUBLISH_AMOUNT}
                            required
                        />
                        <p className="text-xs text-muted-foreground">
                            Available balance: KES {balance.toLocaleString("en-KE", { minimumFractionDigits: 2 })}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="viewFrequency">View Frequency</Label>
                        <Select
                            value={viewFrequency.toString()}
                            onValueChange={(v) => setViewFrequency(parseInt(v) as AdViewFrequency)}
                        >
                            <SelectTrigger id="viewFrequency">
                                <SelectValue placeholder="Select view frequency" />
                            </SelectTrigger>
                            <SelectContent>
                                {AD_VIEW_FREQUENCY_OPTIONS.map((option) => (
                                    <SelectItem key={option.value} value={option.value.toString()}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                            {AD_VIEW_FREQUENCY_OPTIONS.find(o => o.value === viewFrequency)?.description}
                        </p>
                    </div>

                    {amountValue > 0 && (
                        <ViewCalculator amount={amountValue} />
                    )}

                    {!hasEnoughBalance && amountValue > 0 && (
                        <p className="text-sm text-destructive">
                            Insufficient balance. Please deposit more funds.
                        </p>
                    )}

                    <DialogFooter className="gap-2">
                        <Button type="button" variant="outline" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading || !isValidAmount || !hasEnoughBalance}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 size-4 animate-spin" />
                                    Publishing...
                                </>
                            ) : (
                                "Publish Promotion"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
