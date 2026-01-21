import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { COOKIES } from "@/constants"
import { queryTransactionStatus, QueryResult } from "@/lib/mpesa"

interface QueryRequestBody {
  checkoutRequestId: string
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get(COOKIES.User)?.value

    if (!userId) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body: QueryRequestBody = await request.json()
    const { checkoutRequestId } = body

    if (!checkoutRequestId) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Checkout request ID is required" },
        { status: 400 }
      )
    }

    const result = await queryTransactionStatus(checkoutRequestId)

    return NextResponse.json<ApiResponse<QueryResult>>({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error("[M-Pesa Query Error]:", error)
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Failed to query transaction status" },
      { status: 500 }
    )
  }
}
