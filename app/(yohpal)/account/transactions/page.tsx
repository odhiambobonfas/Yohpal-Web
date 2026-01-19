"use client"

import { useTransactions } from "@/hooks/account"
import { TransactionTable } from "@/components/custom/account/transactions/TransactionTable"

export default function TransactionsPage() {
  const { transactions, loading, pagination, filters, updateFilters, goToPage } =
    useTransactions()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Transaction History</h1>
        <p className="text-muted-foreground">
          View and filter all your transactions
        </p>
      </div>

      <TransactionTable
        transactions={transactions}
        loading={loading}
        pagination={pagination}
        filters={filters}
        onFilterChange={updateFilters}
        onPageChange={goToPage}
      />
    </div>
  )
}
