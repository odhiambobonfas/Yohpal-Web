"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { AccountBalance } from "@/types/account"

interface EarningsBreakdownProps {
  balance: AccountBalance | null
  loading: boolean
}

function formatCurrency(amount: number): string {
  return `KES ${amount.toLocaleString()}`
}

export function EarningsBreakdown({ balance, loading }: EarningsBreakdownProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 2 }).map((unused, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  const totalEarnings = balance?.totalEarnings || 0
  const referralEarnings = balance?.referralEarnings || 0
  const bonusEarnings = balance?.bonusEarnings || 0

  const referralPercentage = totalEarnings > 0 ? (referralEarnings / totalEarnings) * 100 : 0
  const bonusPercentage = totalEarnings > 0 ? (bonusEarnings / totalEarnings) * 100 : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Earnings Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Referral Earnings</span>
            <span className="font-medium">{formatCurrency(referralEarnings)}</span>
          </div>
          <Progress value={referralPercentage} className="h-2 bg-blue-100">
            <div
              className="h-full bg-blue-500 rounded-full transition-all"
              style={{ width: `${referralPercentage}%` }}
            />
          </Progress>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Bonus Earnings</span>
            <span className="font-medium">{formatCurrency(bonusEarnings)}</span>
          </div>
          <Progress value={bonusPercentage} className="h-2 bg-green-100">
            <div
              className="h-full bg-green-500 rounded-full transition-all"
              style={{ width: `${bonusPercentage}%` }}
            />
          </Progress>
        </div>
        <div className="pt-2 border-t">
          <div className="flex justify-between">
            <span className="font-medium">Total Earnings</span>
            <span className="font-bold text-green-600">{formatCurrency(totalEarnings)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
