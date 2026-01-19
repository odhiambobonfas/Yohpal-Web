import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Eye, MousePointer, Target, TrendingUp } from "lucide-react"

interface AdStatsCardProps {
    impressions: number
    clicks: number
    ctr: number
    totalSpent: number
    loading?: boolean
}

export function AdStatsCard({
    impressions,
    clicks,
    ctr,
    totalSpent,
    loading,
}: AdStatsCardProps) {
    if (loading) {
        return (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((unused, i) => (
                    <Card key={i}>
                        <CardHeader className="pb-2">
                            <Skeleton className="h-4 w-20" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-24" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }

    const stats = [
        {
            title: "Impressions",
            value: impressions.toLocaleString(),
            icon: Eye,
        },
        {
            title: "Clicks",
            value: clicks.toLocaleString(),
            icon: MousePointer,
        },
        {
            title: "CTR",
            value: `${ctr.toFixed(2)}%`,
            icon: Target,
        },
        {
            title: "Total Spent",
            value: `KES ${totalSpent.toLocaleString("en-KE", { minimumFractionDigits: 2 })}`,
            icon: TrendingUp,
        },
    ]

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
                <Card key={stat.title}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                        <stat.icon className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stat.value}</div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
