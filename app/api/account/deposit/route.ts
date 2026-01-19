import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { COOKIES } from "@/constants"
import { DepositRequest, DepositResponse, ApiResponse } from "@/types/account"

const DEPOSIT_API_URL = process.env.YOHPAL_ACCOUNT_API_URL || "https://yohpal-apis.onrender.com"

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

    const body: DepositRequest = await request.json()
    const { phoneNumber, amount } = body

    // Validate input
    if (!phoneNumber || !amount) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Phone number and amount are required" },
        { status: 400 }
      )
    }

    if (amount < 10) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Minimum deposit amount is KES 10" },
        { status: 400 }
      )
    }

    // Format phone number (ensure it starts with 254)
    let formattedPhone = phoneNumber.replace(/\s/g, "")
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "254" + formattedPhone.slice(1)
    } else if (formattedPhone.startsWith("+254")) {
      formattedPhone = formattedPhone.slice(1)
    } else if (!formattedPhone.startsWith("254")) {
      formattedPhone = "254" + formattedPhone
    }

    // Call the backend M-Pesa STK push API
    const response = await fetch(`${DEPOSIT_API_URL}/deposit/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        phoneNumber: formattedPhone,
        amount: Math.round(amount),
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: data.message || "Deposit request failed" },
        { status: response.status }
      )
    }

    return NextResponse.json<ApiResponse<DepositResponse>>({
      success: true,
      data: {
        success: true,
        message: "STK push sent. Please check your phone and enter your M-Pesa PIN.",
        transactionId: data.transactionId,
        checkoutRequestId: data.checkoutRequestId,
      },
    })
  } catch (error) {
    console.error("Error processing deposit:", error)
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Failed to process deposit request" },
      { status: 500 }
    )
  }
}
