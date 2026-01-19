"use client"

import Link from "next/link"
import {
  ArrowDownToLine,
  Megaphone,
  Share2,
  History,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function QuickActions() {
  const actions = [
    {
      icon: ArrowDownToLine,
      label: "Deposit",
      href: "/account/deposit",
      variant: "default" as const,
    },
    {
      icon: Megaphone,
      label: "Create Ad",
      href: "/account/ads/create",
      variant: "outline" as const,
    },
    {
      icon: Share2,
      label: "Share Referral",
      href: "/account/network",
      variant: "outline" as const,
    },
    {
      icon: History,
      label: "View History",
      href: "/account/transactions",
      variant: "outline" as const,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2">
        {actions.map((action) => (
          <Button
            key={action.label}
            variant={action.variant}
            className="justify-start"
            asChild
          >
            <Link href={action.href}>
              <action.icon className="mr-2 h-4 w-4" />
              {action.label}
            </Link>
          </Button>
        ))}
      </CardContent>
    </Card>
  )
}
