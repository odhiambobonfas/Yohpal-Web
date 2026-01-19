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

const TRANSACTIONS_API_URL =
  process.env.YOHPAL_TRANSACTIONS_API_URL || "https://yohpal-apis-test.onrender.com"

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

    // Try fetching from external API first
    try {
      const externalResponse = await fetch(
        `${TRANSACTIONS_API_URL}/transactionHistory/${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      )

      if (externalResponse.ok) {
        const externalData = await externalResponse.json()
        // Transform external data to our format if needed
        if (externalData.transactions) {
          const transactions: Transaction[] = externalData.transactions.map(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (t: any) => ({
              id: t.id || t.transactionId,
              userId: t.userId || userId,
              type: t.type || "deposit",
              amount: t.amount || 0,
              status: t.status || "completed",
              description: t.description || t.type || "Transaction",
              reference: t.reference || t.transactionId,
              phoneNumber: t.phoneNumber,
              createdAt: t.createdAt || t.timestamp,
              completedAt: t.completedAt,
            })
          )

          // Apply filters
          let filtered = transactions

          if (filters.type && filters.type !== "all") {
            filtered = filtered.filter((t) => t.type === filters.type)
          }

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
        }
      }
    } catch {
      // Fall through to Firestore query
    }

    // Fallback: Query from Firestore
    let query = db
      .collection("transactions")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")

    if (filters.type && filters.type !== "all") {
      query = query.where("type", "==", filters.type)
    }

    if (filters.status && filters.status !== "all") {
      query = query.where("status", "==", filters.status)
    }

    const snapshot = await query.get()

    const transactions: Transaction[] = []
    snapshot.forEach((doc) => {
      const data = doc.data()
      transactions.push({
        id: doc.id,
        userId: data.userId,
        type: data.type,
        amount: data.amount,
        status: data.status,
        description: data.description || data.type,
        reference: data.reference,
        phoneNumber: data.phoneNumber,
        createdAt: data.createdAt,
        completedAt: data.completedAt,
      })
    })

    // Pagination
    const page = filters.page || 1
    const limit = filters.limit || 20
    const start = (page - 1) * limit
    const paginatedTransactions = transactions.slice(start, start + limit)

    return NextResponse.json<ApiResponse<TransactionHistoryResponse>>({
      success: true,
      data: {
        transactions: paginatedTransactions,
        total: transactions.length,
        page,
        totalPages: Math.ceil(transactions.length / limit),
        hasMore: start + limit < transactions.length,
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
