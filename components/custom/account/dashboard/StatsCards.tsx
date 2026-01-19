"use client"

import {
  ArrowDownToLine,
  TrendingUp,
  Wallet,
  Users,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { AccountBalance } from "@/types/account"

interface StatsCardsProps {
  balance: AccountBalance | null
  loading: boolean
}

function formatCurrency(amount: number): string {
  return `KES ${amount.toLocaleString()}`
}

export function StatsCards({ balance, loading }: StatsCardsProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((unused, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-2 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const stats = [
    {
      title: "Total Deposits",
      value: formatCurrency(balance?.totalDeposits || 0),
      icon: ArrowDownToLine,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      progress: Math.min(100, ((balance?.totalDeposits || 0) / 10000) * 100),
    },
    {
      title: "Total Earnings",
      value: formatCurrency(balance?.totalEarnings || 0),
      icon: TrendingUp,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      progress: Math.min(100, ((balance?.totalEarnings || 0) / 5000) * 100),
    },
    {
      title: "Available Balance",
      value: formatCurrency(balance?.availableBalance || 0),
      icon: Wallet,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      progress: Math.min(100, ((balance?.availableBalance || 0) / 10000) * 100),
    },
    {
      title: "Network Size",
      value: String(balance?.networkSize || 0),
      icon: Users,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      progress: Math.min(100, ((balance?.networkSize || 0) / 100) * 100),
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">{stat.value}</div>
            <Progress value={stat.progress} className="h-1.5" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
