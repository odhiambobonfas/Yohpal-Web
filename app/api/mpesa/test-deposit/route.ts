import { NextResponse } from "next/server"
import { initiateStkPush } from "@/lib/mpesa"

/**
 * TEST ENDPOINT - Initiate deposit without auth
 * DELETE THIS FILE BEFORE PRODUCTION DEPLOYMENT
 */

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "This endpoint is disabled in production" },
      { status: 403 }
    )
  }

  try {
    const { phoneNumber, amount, userId } = await request.json()

    if (!phoneNumber || !amount || !userId) {
      return NextResponse.json(
        { error: "phoneNumber, amount, and userId are required" },
        { status: 400 }
      )
    }

    const result = await initiateStkPush({
      phoneNumber,
      amount,
      userId,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("[Test Deposit] Error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
