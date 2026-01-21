import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { COOKIES } from "@/constants"
import { db } from "@/lib/firebase/firebase.admin"
import {
  Transaction,
  TransactionFilters,
  TransactionHistoryResponse,
  ApiResponse,
} from "@/types/account"

// Helper to format Firestore timestamp to ISO string
function formatTimestamp(timestamp: unknown): string {
  if (!timestamp) return new Date().toISOString()

  // Firestore Timestamp object
  if (typeof timestamp === "object" && timestamp !== null) {
    const ts = timestamp as { _seconds?: number; seconds?: number; toDate?: () => Date }
    if (ts.toDate) return ts.toDate().toISOString()
    if (ts._seconds) return new Date(ts._seconds * 1000).toISOString()
    if (ts.seconds) return new Date(ts.seconds * 1000).toISOString()
  }

  // Already a string
  if (typeof timestamp === "string") return timestamp

  // Number (unix timestamp)
  if (typeof timestamp === "number") return new Date(timestamp).toISOString()

  return new Date().toISOString()
}

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get(COOKIES.User)?.value

    if (!userId) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Parse query params
    const { searchParams } = new URL(request.url)
    const filters: TransactionFilters = {
      type: (searchParams.get("type") as TransactionFilters["type"]) || "all",
      status: (searchParams.get("status") as TransactionFilters["status"]) || "all",
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "20"),
    }

    // Query from mpesa_transactions collection
    const snapshot = await db
      .collection("mpesa_transactions")
      .where("userId", "==", userId)
      .get()

    const transactions: Transaction[] = []
    snapshot.forEach((doc) => {
      const data = doc.data()

      // Map mpesa_transactions status to our status type
      let status: Transaction["status"] = "pending"
      if (data.status === "completed") status = "completed"
      else if (data.status === "failed" || data.status === "cancelled") status = "cancelled"

      transactions.push({
        id: doc.id,
        userId: data.userId,
        type: "deposit",
        amount: data.amount || 0,
        status,
        description: "M-Pesa Deposit",
        reference: data.mpesaReceiptNumber || data.merchantRequestId,
        phoneNumber: data.phoneNumber,
        createdAt: formatTimestamp(data.createdAt),
        completedAt: data.completedAt ? formatTimestamp(data.completedAt) : undefined,
      })
    })

    // Sort by createdAt descending (newest first)
    transactions.sort((a, b) => {
      const dateA = new Date(a.createdAt as string).getTime()
      const dateB = new Date(b.createdAt as string).getTime()
      return dateB - dateA
    })

    // Apply filters
    let filtered = transactions

    if (filters.status && filters.status !== "all") {
      filtered = filtered.filter((t) => t.status === filters.status)
    }

    // Pagination
    const page = filters.page || 1
    const limit = filters.limit || 20
    const start = (page - 1) * limit
    const paginatedTransactions = filtered.slice(start, start + limit)

    return NextResponse.json<ApiResponse<TransactionHistoryResponse>>({
      success: true,
      data: {
        transactions: paginatedTransactions,
        total: filtered.length,
        page,
        totalPages: Math.ceil(filtered.length / limit),
        hasMore: start + limit < filtered.length,
      },
    })
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Failed to fetch transactions" },
      { status: 500 }
    )
  }
}
