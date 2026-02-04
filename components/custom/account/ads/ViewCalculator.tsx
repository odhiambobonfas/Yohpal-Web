"use client"

import { useMemo } from "react"
import { calculateViewsFromAmount } from "@/lib/ads/calculations"
import { Clock, Eye, Coins } from "lucide-react"

interface ViewCalculatorProps {
    amount: number
    className?: string
}

export function ViewCalculator({ amount, className = "" }: ViewCalculatorProps) {
    const calculation = useMemo(() => {
        return calculateViewsFromAmount(amount)
    }, [amount])

    if (amount <= 0) {
        return null
    }

    return (
        <div className={`rounded-lg bg-muted/50 p-3 ${className}`}>
            <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
                <div className="flex items-center gap-2">
                    <Coins className="size-4 text-primary" />
                    <span className="font-medium">KES {amount.toLocaleString("en-KE")}</span>
                </div>
                <span className="text-muted-foreground hidden sm:inline">=</span>
                <div className="flex items-center gap-2">
                    <Eye className="size-4 text-primary" />
                    <span className="font-medium">{calculation.views.toLocaleString()} views</span>
                </div>
                <span className="text-muted-foreground hidden sm:inline">=</span>
                <div className="flex items-center gap-2">
                    <Clock className="size-4 text-primary" />
                    <span className="font-medium">{calculation.formattedTime}</span>
                </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground text-center">
                Each view is 15 seconds of ad display time
            </p>
        </div>
    )
}
