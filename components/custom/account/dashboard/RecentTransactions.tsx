"use client"

import Link from "next/link"
import {
  ArrowDownToLine,
  Users,
  Gift,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardAction } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Transaction, TransactionType, TransactionStatus } from "@/types/account"
import { cn } from "@/lib/utils"

interface RecentTransactionsProps {
  transactions: Transaction[]
  loading: boolean
}

function formatCurrency(amount: number, type: TransactionType): string {
  const prefix = type === "withdrawal" ? "-" : "+"
  return `${prefix}KES ${Math.abs(amount).toLocaleString()}`
}

function formatDate(date: string | { seconds: number; nanoseconds: number }): string {
  const d = typeof date === "string" ? new Date(date) : new Date(date.seconds * 1000)
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

const typeConfig: Record<TransactionType, { icon: typeof ArrowDownToLine; color: string }> = {
  deposit: { icon: ArrowDownToLine, color: "text-blue-500" },
  withdrawal: { icon: ArrowUpFromLine, color: "text-red-500" },
  referral: { icon: Users, color: "text-green-500" },
  bonus: { icon: Gift, color: "text-purple-500" },
}

const statusConfig: Record<TransactionStatus, { icon: typeof CheckCircle2; color: string; label: string }> = {
  completed: { icon: CheckCircle2, color: "text-green-500", label: "Completed" },
  pending: { icon: Clock, color: "text-yellow-500", label: "Pending" },
  failed: { icon: XCircle, color: "text-red-500", label: "Failed" },
  cancelled: { icon: XCircle, color: "text-gray-500", label: "Cancelled" },
}

export function RecentTransactions({ transactions, loading }: RecentTransactionsProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((unused, i) => (
            <div key={i} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <div className="text-right space-y-1">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  const recentTransactions = transactions.slice(0, 5)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Transactions</CardTitle>
        <CardAction>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/account/transactions">View All</Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {recentTransactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No transactions yet
          </div>
        ) : (
          <div className="space-y-1">
            {recentTransactions.map((transaction) => {
              const TypeIcon = typeConfig[transaction.type]?.icon || ArrowDownToLine
              const typeColor = typeConfig[transaction.type]?.color || "text-gray-500"
              const StatusIcon = statusConfig[transaction.status]?.icon || Clock
              const statusColor = statusConfig[transaction.status]?.color || "text-gray-500"

              return (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between py-3 border-b last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-full bg-muted", typeColor)}>
                      <TypeIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium capitalize">{transaction.type}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(transaction.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={cn(
                        "font-medium",
                        transaction.type === "withdrawal" ? "text-red-500" : "text-green-500"
                      )}
                    >
                      {formatCurrency(transaction.amount, transaction.type)}
                    </p>
                    <Badge
                      variant="secondary"
                      className={cn("text-xs gap-1", statusColor)}
                    >
                      <StatusIcon className="h-3 w-3" />
                      {statusConfig[transaction.status]?.label || transaction.status}
                    </Badge>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
