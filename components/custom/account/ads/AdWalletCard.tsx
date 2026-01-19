"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Wallet, ArrowDownToLine, TrendingUp } from "lucide-react"
import Link from "next/link"

interface AdWalletCardProps {
    balance: number
    totalDeposited: number
    totalSpent: number
    loading?: boolean
}

export function AdWalletCard({
    balance,
    totalDeposited,
    totalSpent,
    loading,
}: AdWalletCardProps) {
    if (loading) {
        return (
            <Card>
                <CardHeader className="pb-2">
                    <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-10 w-32" />
                    <div className="grid grid-cols-2 gap-4">
                        <Skeleton className="h-16" />
                        <Skeleton className="h-16" />
                    </div>
                    <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Ad Wallet Balance</CardTitle>
                <Wallet className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="text-3xl font-bold">
                    KES {balance.toLocaleString("en-KE", { minimumFractionDigits: 2 })}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <ArrowDownToLine className="size-3" />
                            Total Deposited
                        </div>
                        <div className="font-semibold">
                            KES {totalDeposited.toLocaleString("en-KE", { minimumFractionDigits: 2 })}
                        </div>
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <TrendingUp className="size-3" />
                            Total Spent
                        </div>
                        <div className="font-semibold">
                            KES {totalSpent.toLocaleString("en-KE", { minimumFractionDigits: 2 })}
                        </div>
                    </div>
                </div>

                <Button asChild className="w-full">
                    <Link href="/account/ads?deposit=true">
                        <ArrowDownToLine className="mr-2 size-4" />
                        Deposit Funds
                    </Link>
                </Button>
            </CardContent>
        </Card>
    )
}
