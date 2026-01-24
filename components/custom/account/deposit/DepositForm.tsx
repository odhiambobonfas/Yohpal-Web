"use client"

import { useState } from "react"
import { Phone, Banknote, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useDeposit, useDepositStatus } from "@/hooks/account"
import { DepositStatusOverlay } from "./DepositStatusOverlay"
import { toast } from "sonner"

const quickAmounts = [100, 500, 1000, 2000, 5000]

export function DepositForm() {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [amount, setAmount] = useState("")
  const [pendingAmount, setPendingAmount] = useState(0)
  const { deposit, loading } = useDeposit()
  const { status, message, startPolling, reset: resetStatus } = useDepositStatus()

  const handleQuickAmount = (value: number) => {
    setAmount(String(value))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!phoneNumber || !amount) {
      toast.error("Please enter phone number and amount")
      return
    }

    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum < 10) {
      toast.error("Minimum deposit amount is KES 10")
      return
    }

    try {
      setPendingAmount(amountNum)
      const response = await deposit({ phoneNumber, amount: amountNum })

      // Start polling for status if we have a checkout request ID
      if (response?.checkoutRequestId) {
        startPolling(response.checkoutRequestId)
      }
    } catch {
      toast.error("Failed to initiate deposit. Please try again.")
    }
  }

  const handleOverlayClose = () => {
    resetStatus()
    if (status === "completed") {
      setAmount("")
      // Optionally refresh balance here
    }
  }

  const handleRetry = () => {
    resetStatus()
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Banknote className="h-5 w-5" />
            Deposit via M-Pesa
          </CardTitle>
          <CardDescription>
            Enter your phone number and amount to receive an M-Pesa STK push
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="phone">M-Pesa Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="07XX or 01XX..."
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="pl-10"
                  disabled={loading || status === "pending"}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Safaricom M-Pesa number (07XX or 01XX)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (KES)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                  KES
                </span>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-14"
                  min={10}
                  disabled={loading || status === "pending"}
                />
              </div>
              <p className="text-xs text-muted-foreground">Minimum deposit: KES 10</p>
            </div>

            <div className="space-y-2">
              <Label>Quick Amounts</Label>
              <div className="flex flex-wrap gap-2">
                {quickAmounts.map((value) => (
                  <Button
                    key={value}
                    type="button"
                    variant={amount === String(value) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleQuickAmount(value)}
                    disabled={loading || status === "pending"}
                  >
                    KES {value.toLocaleString()}
                  </Button>
                ))}
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading || status === "pending"}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Banknote className="mr-2 h-4 w-4" />
                  Deposit via M-Pesa
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Status Overlay */}
      {status !== "idle" && (
        <DepositStatusOverlay
          status={status}
          message={message}
          amount={pendingAmount}
          onClose={handleOverlayClose}
          onRetry={handleRetry}
        />
      )}
    </>
  )
}
