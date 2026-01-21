import { NextResponse } from "next/server"
import { processCallback, MpesaCallback } from "@/lib/mpesa"

/**
 * M-Pesa Callback Endpoint
 * This endpoint receives payment confirmations from Safaricom M-Pesa
 *
 * IMPORTANT: This endpoint must:
 * - Always return 200 OK to prevent M-Pesa retries
 * - Process the callback asynchronously if needed
 * - Log all callbacks for debugging
 */
export async function POST(request: Request) {
  try {
    const callbackData: MpesaCallback = await request.json()

    console.log("[M-Pesa Callback] Raw data:", JSON.stringify(callbackData))

    // Process the callback
    const result = await processCallback(callbackData)

    console.log("[M-Pesa Callback] Result:", result)

    // Always return 200 OK to M-Pesa
    return NextResponse.json(
      { ResultCode: 0, ResultDesc: result.message },
      { status: 200 }
    )
  } catch (error) {
    console.error("[M-Pesa Callback] Error:", error)

    // Still return 200 to prevent M-Pesa retries
    // Errors are logged for debugging
    return NextResponse.json(
      { ResultCode: 0, ResultDesc: "Callback received" },
      { status: 200 }
    )
  }
}

// Allow Safaricom to reach this endpoint without CSRF protection
export const dynamic = "force-dynamic"
