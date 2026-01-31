"use client"

import { useState } from "react"
import { useRepublishPromotion } from "@/hooks/promotions"
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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"
import { Loader2, RefreshCw, Eye, Clock, Info } from "lucide-react"
import { ViewCalculator } from "../ads/ViewCalculator"
import { VideoPromotion, AdViewFrequency } from "@/types/ads"
import { AD_MIN_PUBLISH_AMOUNT, AD_VIEW_FREQUENCY_OPTIONS, AD_DEFAULT_VIEW_FREQUENCY } from "@/constants"
import { formatAdTime, calculateTimeDelivered } from "@/lib/ads/calculations"

interface RepublishPromotionDialogProps {
    promotion: VideoPromotion
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export function RepublishPromotionDialog({ promotion, open, onOpenChange, onSuccess }: RepublishPromotionDialogProps) {
    const { republishPromotion, loading, reset } = useRepublishPromotion()
    const { balance, refetch: refetchWallet } = useAdWallet()
    const [amount, setAmount] = useState("")
    const currentViewFrequency = (promotion.viewFrequency ?? AD_DEFAULT_VIEW_FREQUENCY) as AdViewFrequency
    const [viewFrequency, setViewFrequency] = useState<AdViewFrequency>(currentViewFrequency)

    const amountValue = parseFloat(amount) || 0
    const isValidAmount = amountValue >= AD_MIN_PUBLISH_AMOUNT
    const hasEnoughBalance = balance >= amountValue

    const currentTimeDelivered = calculateTimeDelivered(promotion.viewsGenerated)

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
            await republishPromotion(promotion.id, amountValue, viewFrequency)
            toast.success("Promotion republished successfully!")
            refetchWallet()
            onSuccess?.()
            handleClose()
        } catch {
            toast.error("Failed to republish promotion")
        }
    }

    const handleClose = () => {
        reset()
        setAmount("")
        setViewFrequency(currentViewFrequency)
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <RefreshCw className="size-5" />
                        Republish Promotion
                    </DialogTitle>
                    <DialogDescription>
                        Add more budget to continue promoting this video
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2">
                            <Eye className="size-4 text-primary" />
                            <div>
                                <p className="text-xs text-muted-foreground">Views so far</p>
                                <p className="font-semibold">{promotion.viewsGenerated.toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="size-4 text-primary" />
                            <div>
                                <p className="text-xs text-muted-foreground">Time delivered</p>
                                <p className="font-semibold">{formatAdTime(currentTimeDelivered)}</p>
                            </div>
                        </div>
                    </div>

                    <Alert>
                        <Info className="size-4" />
                        <AlertDescription>
                            View counter continues from {promotion.viewsGenerated.toLocaleString()} views.
                            Your total views and time delivered will accumulate.
                        </AlertDescription>
                    </Alert>

                    <div className="space-y-2">
                        <Label htmlFor="amount">Additional Budget (KES)</Label>
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
                                    Republishing...
                                </>
                            ) : (
                                "Republish Promotion"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
