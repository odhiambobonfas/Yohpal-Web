"use client"

import { useEffect } from "react"
import Image from "next/image"
import { CheckCircle2, XCircle, Ban } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { DepositStatus } from "@/hooks/account/useDepositStatus"

interface DepositStatusOverlayProps {
  status: DepositStatus
  message: string
  amount: number
  onClose: () => void
  onRetry?: () => void
}

export function DepositStatusOverlay({
  status,
  message,
  amount,
  onClose,
  onRetry,
}: DepositStatusOverlayProps) {
  // Prevent body scroll when overlay is open
  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = ""
    }
  }, [])

  if (status === "idle") return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6 p-8 max-w-sm text-center">
        {/* Status Icon/Animation */}
        <div className="relative">
          {status === "pending" && (
            <div className="relative">
              {/* Pulsing ring */}
              <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
              {/* Spinning ring */}
              <div className="absolute -inset-4 animate-spin rounded-full border-4 border-transparent border-t-primary" style={{ animationDuration: "1.5s" }} />
              {/* Logo */}
              <div className="relative h-24 w-24 animate-pulse">
                <Image
                  src="/logo_circular.png"
                  alt="Yohpal"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          )}

          {status === "completed" && (
            <div className="animate-in zoom-in-50 duration-300">
              <div className="relative">
                <div className="absolute inset-0 animate-ping rounded-full bg-green-500/20" style={{ animationIterationCount: 3 }} />
                <CheckCircle2 className="h-24 w-24 text-green-500" strokeWidth={1.5} />
              </div>
            </div>
          )}

          {status === "failed" && (
            <div className="animate-in zoom-in-50 duration-300">
              <XCircle className="h-24 w-24 text-destructive" strokeWidth={1.5} />
            </div>
          )}

          {status === "cancelled" && (
            <div className="animate-in zoom-in-50 duration-300">
              <Ban className="h-24 w-24 text-muted-foreground" strokeWidth={1.5} />
            </div>
          )}
        </div>

        {/* Status Text */}
        <div className="space-y-2">
          <h2 className={cn(
            "text-2xl font-bold",
            status === "completed" && "text-green-500",
            status === "failed" && "text-destructive",
            status === "cancelled" && "text-muted-foreground"
          )}>
            {status === "pending" && "Processing Payment"}
            {status === "completed" && "Payment Successful!"}
            {status === "failed" && "Payment Failed"}
            {status === "cancelled" && "Payment Cancelled"}
          </h2>
          <p className="text-muted-foreground">{message}</p>
          {status === "pending" && (
            <p className="text-sm font-medium text-primary">
              KES {amount.toLocaleString()}
            </p>
          )}
          {status === "completed" && (
            <p className="text-sm font-medium text-green-500">
              KES {amount.toLocaleString()} added to your balance
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-4">
          {status === "pending" ? (
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          ) : (
            <>
              {(status === "failed" || status === "cancelled") && onRetry && (
                <Button variant="outline" onClick={onRetry}>
                  Try Again
                </Button>
              )}
              <Button onClick={onClose}>
                {status === "completed" ? "Done" : "Close"}
              </Button>
            </>
          )}
        </div>

        {/* M-Pesa branding */}
        {status === "pending" && (
          <p className="text-xs text-muted-foreground mt-4">
            Check your phone for the M-Pesa prompt
          </p>
        )}
      </div>
    </div>
  )
}
