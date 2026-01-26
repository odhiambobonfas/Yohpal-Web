"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Megaphone,
  ArrowDownToLine,
  Users,
  History,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navTabs = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/account" },
  { icon: Megaphone, label: "Ads", href: "/account/ads" },
  { icon: ArrowDownToLine, label: "Deposit", href: "/account/deposit" },
  { icon: Users, label: "Network", href: "/account/network" },
  { icon: History, label: "Transactions", href: "/account/transactions" },
]

export function AccountNavTabs() {
  const pathname = usePathname()

  // Hide nav tabs on onboarding page for immersive experience
  if (pathname === "/account/onboarding") {
    return null
  }

  const isActive = (href: string) => {
    if (href === "/account") {
      return pathname === "/account"
    }
    return pathname.startsWith(href)
  }

  return (
    <div className="border-b">
      <nav className="flex gap-1 overflow-x-auto px-4 py-2 md:px-6">
        {navTabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap",
              isActive(tab.href)
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <tab.icon className="size-4" />
            <span>{tab.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}
