"use client"

import { useState } from "react"
import { useAdDeposit, useAdWallet } from "@/hooks/ads"
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
import { Loader2, CheckCircle2 } from "lucide-react"
import { ViewCalculator } from "./ViewCalculator"
import { AD_MIN_DEPOSIT } from "@/constants"

interface AdDepositDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function AdDepositDialog({ open, onOpenChange }: AdDepositDialogProps) {
    const { deposit, loading, success, response, reset } = useAdDeposit()
    const { refetch } = useAdWallet()
    const [phoneNumber, setPhoneNumber] = useState("")
    const [amount, setAmount] = useState("")

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
            await deposit({
                phoneNumber,
                amount: depositAmount,
            })
            toast.success("Check your phone for the M-Pesa prompt")
        } catch {
            toast.error("Failed to initiate deposit")
        }
    }

    const handleClose = () => {
        reset()
        setPhoneNumber("")
        setAmount("")
        onOpenChange(false)
        if (success) {
            refetch()
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Deposit to Ad Wallet</DialogTitle>
                    <DialogDescription>
                        Add funds to your ad wallet using M-Pesa
                    </DialogDescription>
                </DialogHeader>

                {success ? (
                    <div className="flex flex-col items-center py-6 text-center">
                        <CheckCircle2 className="size-12 text-green-500 mb-4" />
                        <h3 className="font-semibold mb-2">STK Push Sent!</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            {response?.message || "Check your phone and enter your M-Pesa PIN to complete the deposit."}
                        </p>
                        <Button onClick={handleClose}>Done</Button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="phoneNumber">M-Pesa Phone Number</Label>
                            <Input
                                id="phoneNumber"
                                placeholder="07XXXXXXXX"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
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
                                required
                            />
                        </div>

                        {amountValue > 0 && (
                            <ViewCalculator amount={amountValue} />
                        )}

                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleClose}
                                className="flex-1"
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
