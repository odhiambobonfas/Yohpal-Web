"use client"

import { Users, User, ChevronLeft, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Referral, ReferralFilters, ReferralLevel } from "@/types/account"
import { cn } from "@/lib/utils"

interface ReferralsListProps {
  referrals: Referral[]
  loading: boolean
  pagination: {
    total: number
    page: number
    totalPages: number
    hasMore: boolean
  }
  filters: ReferralFilters
  onFilterChange: (filters: Partial<ReferralFilters>) => void
  onPageChange: (page: number) => void
}

function formatDate(date: string | { seconds: number; nanoseconds: number }): string {
  const d = typeof date === "string" ? new Date(date) : new Date(date.seconds * 1000)
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

export function ReferralsList({
  referrals,
  loading,
  pagination,
  filters,
  onFilterChange,
  onPageChange,
}: ReferralsListProps) {
  const handleLevelChange = (value: string) => {
    onFilterChange({ level: value as ReferralLevel | "all" })
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5" />
            Your Network
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full mb-4" />
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((unused, i) => (
              <div key={i} className="flex items-center gap-4 py-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-6 w-20" />
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
          <Users className="h-5 w-5" />
          Your Network
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs
          value={filters.level || "all"}
          onValueChange={handleLevelChange}
          className="mb-4"
        >
          <TabsList className="w-full">
            <TabsTrigger value="all" className="flex-1">
              All ({pagination.total})
            </TabsTrigger>
            <TabsTrigger value="primary" className="flex-1">
              Primary
            </TabsTrigger>
            <TabsTrigger value="secondary" className="flex-1">
              Secondary
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {referrals.length === 0 ? (
          <div className="text-center py-8">
            <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No referrals yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Share your referral code to start building your network
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-1">
              {referrals.map((referral) => (
                <div
                  key={referral.id}
                  className="flex items-center gap-4 py-3 border-b last:border-0"
                >
                  <Avatar>
                    <AvatarImage src={referral.profilePicture} />
                    <AvatarFallback>
                      {getInitials(referral.firstName, referral.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {referral.firstName} {referral.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Joined {formatDate(referral.joinedAt)}
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={cn(
                      referral.level === "primary"
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                        : "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                    )}
                  >
                    {referral.level}
                  </Badge>
                </div>
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t mt-4">
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
