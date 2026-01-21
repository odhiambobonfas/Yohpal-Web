import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { COOKIES } from "@/constants"
import { initiateStkPush } from "@/lib/mpesa"

interface DepositRequestBody {
  phoneNumber: string
  amount: number
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

interface DepositResponseData {
  success: boolean
  message: string
  merchantRequestId?: string
  checkoutRequestId?: string
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

    const body: DepositRequestBody = await request.json()
    const { phoneNumber, amount } = body

    // Validate input
    if (!phoneNumber || !amount) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Phone number and amount are required" },
        { status: 400 }
      )
    }

    // Initiate STK Push using the M-Pesa module
    const result = await initiateStkPush({
      phoneNumber,
      amount,
      userId,
    })

    if (!result.success) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: result.error || result.message },
        { status: 400 }
      )
    }

    return NextResponse.json<ApiResponse<DepositResponseData>>({
      success: true,
      data: {
        success: true,
        message: result.message,
        merchantRequestId: result.merchantRequestId,
        checkoutRequestId: result.checkoutRequestId,
      },
    })
  } catch (error) {
    console.error("[M-Pesa Deposit Error]:", error)
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Failed to process deposit request" },
      { status: 500 }
    )
  }
}
