"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useAdDeposit, useAdWallet } from "@/hooks/ads"
import { useDepositStatus } from "@/hooks/account"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2, CheckCircle2, XCircle, Ban } from "lucide-react"
import { ViewCalculator } from "./ViewCalculator"
import { AD_MIN_DEPOSIT } from "@/constants"

interface AdDepositDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

const PHONE_STORAGE_KEY = "yohpal_mpesa_phone"

export function AdDepositDialog({ open, onOpenChange }: AdDepositDialogProps) {
    const { deposit, loading, reset } = useAdDeposit()
    const { refetch } = useAdWallet()
    const { status, message, startPolling, reset: resetStatus } = useDepositStatus()
    const [phoneNumber, setPhoneNumber] = useState("")
    const [amount, setAmount] = useState("")
    const [pendingAmount, setPendingAmount] = useState(0)

    // Load saved phone number when dialog opens
    useEffect(() => {
        if (open) {
            const savedPhone = localStorage.getItem(PHONE_STORAGE_KEY)
            if (savedPhone) {
                setPhoneNumber(savedPhone)
            }
        }
    }, [open])

    const amountValue = parseFloat(amount) || 0

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const depositAmount = parseFloat(amount)
        if (isNaN(depositAmount) || depositAmount < AD_MIN_DEPOSIT) {
            toast.error(`Minimum deposit is KES ${AD_MIN_DEPOSIT}`)
            return
        }

        if (!phoneNumber || phoneNumber.length < 9) {
            toast.error("Please enter a valid phone number")
            return
        }

        try {
            setPendingAmount(depositAmount)
            // Save phone number for future use
            localStorage.setItem(PHONE_STORAGE_KEY, phoneNumber)

            const response = await deposit({
                phoneNumber,
                amount: depositAmount,
            })

            // Start polling for status
            if (response?.checkoutRequestId) {
                startPolling(response.checkoutRequestId)
            }
        } catch {
            toast.error("Failed to initiate deposit")
        }
    }

    const handleClose = () => {
        reset()
        resetStatus()
        setPhoneNumber("")
        setAmount("")
        onOpenChange(false)
        if (status === "completed") {
            refetch()
        }
    }

    const handleRetry = () => {
        resetStatus()
    }

    // Render status view
    const renderStatusView = () => {
        if (status === "pending") {
            return (
                <div className="flex flex-col items-center py-8 text-center">
                    <div className="relative mb-6">
                        <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
                        <div className="absolute -inset-4 animate-spin rounded-full border-4 border-transparent border-t-primary" style={{ animationDuration: "1.5s" }} />
                        <div className="relative h-20 w-20 animate-pulse">
                            <Image src="/logo_circular.png" alt="Yohpal" fill className="object-contain" priority />
                        </div>
                    </div>
                    <h3 className="font-semibold text-lg mb-2">Processing Payment</h3>
                    <p className="text-sm text-muted-foreground mb-2">{message}</p>
                    <p className="text-sm font-medium text-primary">KES {pendingAmount.toLocaleString()}</p>
                    <Button variant="outline" className="mt-6" onClick={handleClose}>Cancel</Button>
                </div>
            )
        }

        if (status === "completed") {
            return (
                <div className="flex flex-col items-center py-8 text-center">
                    <div className="animate-in zoom-in-50 duration-300 mb-6">
                        <CheckCircle2 className="size-20 text-green-500" strokeWidth={1.5} />
                    </div>
                    <h3 className="font-semibold text-lg text-green-500 mb-2">Payment Successful!</h3>
                    <p className="text-sm text-muted-foreground mb-2">{message}</p>
                    <p className="text-sm font-medium text-green-500">KES {pendingAmount.toLocaleString()} added</p>
                    <Button className="mt-6" onClick={handleClose}>Done</Button>
                </div>
            )
        }

        if (status === "failed") {
            return (
                <div className="flex flex-col items-center py-8 text-center">
                    <div className="animate-in zoom-in-50 duration-300 mb-6">
                        <XCircle className="size-20 text-destructive" strokeWidth={1.5} />
                    </div>
                    <h3 className="font-semibold text-lg text-destructive mb-2">Payment Failed</h3>
                    <p className="text-sm text-muted-foreground mb-4">{message}</p>
                    <div className="flex flex-col sm:flex-row gap-2 w-full">
                        <Button variant="outline" onClick={handleRetry} className="w-full sm:w-auto">Try Again</Button>
                        <Button onClick={handleClose} className="w-full sm:w-auto">Close</Button>
                    </div>
                </div>
            )
        }

        if (status === "cancelled") {
            return (
                <div className="flex flex-col items-center py-8 text-center">
                    <div className="animate-in zoom-in-50 duration-300 mb-6">
                        <Ban className="size-20 text-muted-foreground" strokeWidth={1.5} />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">Payment Cancelled</h3>
                    <p className="text-sm text-muted-foreground mb-4">{message}</p>
                    <div className="flex flex-col sm:flex-row gap-2 w-full">
                        <Button variant="outline" onClick={handleRetry} className="w-full sm:w-auto">Try Again</Button>
                        <Button onClick={handleClose} className="w-full sm:w-auto">Close</Button>
                    </div>
                </div>
            )
        }

        return null
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Deposit Funds</DialogTitle>
                    <DialogDescription>
                        Add funds to your account using M-Pesa
                    </DialogDescription>
                </DialogHeader>

                {status !== "idle" ? (
                    renderStatusView()
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="phoneNumber">M-Pesa Phone Number</Label>
                            <Input
                                id="phoneNumber"
                                placeholder="07XX or 01XX..."
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                disabled={loading}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="amount">Amount (KES)</Label>
                            <Input
                                id="amount"
                                type="number"
                                placeholder={`Minimum KES ${AD_MIN_DEPOSIT}`}
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                min={AD_MIN_DEPOSIT}
                                disabled={loading}
                                required
                            />
                        </div>

                        {amountValue > 0 && (
                            <ViewCalculator amount={amountValue} />
                        )}

                        <div className="flex flex-col sm:flex-row gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleClose}
                                className="flex-1"
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" className="flex-1" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 size-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    "Deposit"
                                )}
                            </Button>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    )
}
