"use client"

import { Filter } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TransactionFilters as TransactionFiltersType, TransactionType, TransactionStatus } from "@/types/account"

interface TransactionFiltersProps {
  filters: TransactionFiltersType
  onFilterChange: (filters: Partial<TransactionFiltersType>) => void
}

export function TransactionFilters({ filters, onFilterChange }: TransactionFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-muted/50 rounded-lg">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Filter className="h-4 w-4" />
        Filters
      </div>

      <Select
        value={filters.type || "all"}
        onValueChange={(value) =>
          onFilterChange({ type: value as TransactionType | "all" })
        }
      >
        <SelectTrigger className="w-[140px] h-9">
          <SelectValue placeholder="All Types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="deposit">Deposits</SelectItem>
          <SelectItem value="withdrawal">Withdrawals</SelectItem>
          <SelectItem value="referral">Referrals</SelectItem>
          <SelectItem value="bonus">Bonuses</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.status || "all"}
        onValueChange={(value) =>
          onFilterChange({ status: value as TransactionStatus | "all" })
        }
      >
        <SelectTrigger className="w-[140px] h-9">
          <SelectValue placeholder="All Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="failed">Failed</SelectItem>
          <SelectItem value="cancelled">Cancelled</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
