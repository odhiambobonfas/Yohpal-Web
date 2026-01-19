"use client"

import { Users, UserPlus, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { NetworkStats as NetworkStatsType } from "@/types/account"

interface NetworkStatsProps {
  stats: NetworkStatsType | null
  loading: boolean
}

function formatCurrency(amount: number): string {
  return `KES ${amount.toLocaleString()}`
}

export function NetworkStats({ stats, loading }: NetworkStatsProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((unused, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-2 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const statsData = [
    {
      title: "Primary Referrals",
      value: stats?.primaryReferrals || 0,
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      description: "Direct referrals",
    },
    {
      title: "Secondary Referrals",
      value: stats?.secondaryReferrals || 0,
      icon: UserPlus,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      description: "Referrals by your network",
    },
    {
      title: "Network Earnings",
      value: formatCurrency(stats?.totalNetworkEarnings || 0),
      icon: TrendingUp,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      description: "Total earnings from referrals",
      isAmount: true,
    },
  ]

  const totalNetwork = stats?.totalNetworkSize || 0
  const targetNetwork = 100 // Example target

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        {statsData.map((stat) => (
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
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Network Growth</span>
            <span className="text-sm text-muted-foreground">
              {totalNetwork} / {targetNetwork} members
            </span>
          </div>
          <Progress value={(totalNetwork / targetNetwork) * 100} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            {targetNetwork - totalNetwork > 0
              ? `${targetNetwork - totalNetwork} more referrals to reach your next milestone!`
              : "Congratulations! You've reached your milestone!"}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
