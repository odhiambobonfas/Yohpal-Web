"use client"

import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Users,
  Gift,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Receipt,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Transaction,
  TransactionType,
  TransactionStatus,
  TransactionFilters,
} from "@/types/account"
import { cn } from "@/lib/utils"
import { TransactionFilters as TransactionFiltersComponent } from "./TransactionFilters"

interface TransactionTableProps {
  transactions: Transaction[]
  loading: boolean
  pagination: {
    total: number
    page: number
    totalPages: number
    hasMore: boolean
  }
  filters: TransactionFilters
  onFilterChange: (filters: Partial<TransactionFilters>) => void
  onPageChange: (page: number) => void
}

function formatCurrency(amount: number, type: TransactionType): string {
  const prefix = type === "withdrawal" ? "-" : "+"
  return `${prefix}KES ${Math.abs(amount).toLocaleString()}`
}

function formatDate(date: string | { seconds: number; nanoseconds: number }): string {
  const d = typeof date === "string" ? new Date(date) : new Date(date.seconds * 1000)
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const typeConfig: Record<
  TransactionType,
  { icon: typeof ArrowDownToLine; color: string; bgColor: string; label: string }
> = {
  deposit: {
    icon: ArrowDownToLine,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    label: "Deposit",
  },
  withdrawal: {
    icon: ArrowUpFromLine,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    label: "Withdrawal",
  },
  referral: {
    icon: Users,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    label: "Referral",
  },
  bonus: {
    icon: Gift,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    label: "Bonus",
  },
}

const statusConfig: Record<
  TransactionStatus,
  { icon: typeof CheckCircle2; color: string; bgColor: string; label: string }
> = {
  completed: {
    icon: CheckCircle2,
    color: "text-green-600",
    bgColor: "bg-green-100 dark:bg-green-900/30",
    label: "Completed",
  },
  pending: {
    icon: Clock,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
    label: "Pending",
  },
  failed: {
    icon: XCircle,
    color: "text-red-600",
    bgColor: "bg-red-100 dark:bg-red-900/30",
    label: "Failed",
  },
  cancelled: {
    icon: XCircle,
    color: "text-gray-600",
    bgColor: "bg-gray-100 dark:bg-gray-900/30",
    label: "Cancelled",
  },
}

export function TransactionTable({
  transactions,
  loading,
  pagination,
  filters,
  onFilterChange,
  onPageChange,
}: TransactionTableProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Receipt className="h-5 w-5" />
            Transaction History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-12 w-full mb-4" />
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((unused, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-4 border-b"
              >
                <div className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-24" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Receipt className="h-5 w-5" />
          Transaction History
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <TransactionFiltersComponent filters={filters} onFilterChange={onFilterChange} />

        {transactions.length === 0 ? (
          <div className="text-center py-12">
            <Receipt className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No transactions found</p>
            <p className="text-sm text-muted-foreground mt-1">
              {filters.type !== "all" || filters.status !== "all"
                ? "Try adjusting your filters"
                : "Your transactions will appear here"}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                      Type
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                      Description
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                      Date
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                      Amount
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => {
                    const typeInfo = typeConfig[transaction.type]
                    const statusInfo = statusConfig[transaction.status]
                    const TypeIcon = typeInfo?.icon || ArrowDownToLine
                    const StatusIcon = statusInfo?.icon || Clock

                    return (
                      <tr key={transaction.id} className="border-b last:border-0">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                "p-2 rounded-full",
                                typeInfo?.bgColor || "bg-gray-100"
                              )}
                            >
                              <TypeIcon
                                className={cn(
                                  "h-4 w-4",
                                  typeInfo?.color || "text-gray-500"
                                )}
                              />
                            </div>
                            <span className="font-medium">
                              {typeInfo?.label || transaction.type}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-muted-foreground">
                          {transaction.description}
                          {transaction.reference && (
                            <span className="block text-xs opacity-75">
                              Ref: {transaction.reference}
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-muted-foreground text-sm">
                          {formatDate(transaction.createdAt)}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span
                            className={cn(
                              "font-semibold",
                              transaction.type === "withdrawal"
                                ? "text-red-500"
                                : "text-green-500"
                            )}
                          >
                            {formatCurrency(transaction.amount, transaction.type)}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <Badge
                            variant="secondary"
                            className={cn(
                              "gap-1",
                              statusInfo?.bgColor,
                              statusInfo?.color
                            )}
                          >
                            <StatusIcon className="h-3 w-3" />
                            {statusInfo?.label || transaction.status}
                          </Badge>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile List */}
            <div className="md:hidden space-y-3">
              {transactions.map((transaction) => {
                const typeInfo = typeConfig[transaction.type]
                const statusInfo = statusConfig[transaction.status]
                const TypeIcon = typeInfo?.icon || ArrowDownToLine
                const StatusIcon = statusInfo?.icon || Clock

                return (
                  <div
                    key={transaction.id}
                    className="p-4 bg-muted/30 rounded-lg space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "p-2 rounded-full",
                            typeInfo?.bgColor || "bg-gray-100"
                          )}
                        >
                          <TypeIcon
                            className={cn(
                              "h-4 w-4",
                              typeInfo?.color || "text-gray-500"
                            )}
                          />
                        </div>
                        <div>
                          <p className="font-medium">
                            {typeInfo?.label || transaction.type}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(transaction.createdAt)}
                          </p>
                        </div>
                      </div>
                      <span
                        className={cn(
                          "font-semibold",
                          transaction.type === "withdrawal"
                            ? "text-red-500"
                            : "text-green-500"
                        )}
                      >
                        {formatCurrency(transaction.amount, transaction.type)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground truncate flex-1 mr-2">
                        {transaction.description}
                      </span>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "gap-1 shrink-0",
                          statusInfo?.bgColor,
                          statusInfo?.color
                        )}
                      >
                        <StatusIcon className="h-3 w-3" />
                        {statusInfo?.label || transaction.status}
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>

            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(pagination.page + 1)}
                  disabled={!pagination.hasMore}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
