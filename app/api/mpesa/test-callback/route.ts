import { NextResponse } from "next/server"
import { processCallback } from "@/lib/mpesa"
import { db } from "@/lib/firebase/firebase.admin"

/**
 * TEST ENDPOINT - Simulate M-Pesa callback locally
 * DELETE THIS FILE BEFORE PRODUCTION DEPLOYMENT
 *
 * Usage: POST /api/mpesa/test-callback
 * Body: { merchantRequestId: "xxx", amount: 100, phoneNumber: "254..." }
 */

export async function POST(request: Request) {
  // Only allow in development
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "This endpoint is disabled in production" },
      { status: 403 }
    )
  }

  try {
    const body = await request.json()
    const { merchantRequestId, amount, phoneNumber } = body

    if (!merchantRequestId) {
      // List pending transactions to help find the right one
      const pending = await db
        .collection("mpesa_transactions")
        .where("status", "==", "pending")
        .limit(10)
        .get()

      const transactions = pending.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))

      return NextResponse.json({
        message: "Provide merchantRequestId to simulate callback",
        pendingTransactions: transactions,
      })
    }

    // Simulate successful M-Pesa callback
    const simulatedCallback = {
      Body: {
        stkCallback: {
          MerchantRequestID: merchantRequestId,
          CheckoutRequestID: `simulated-${Date.now()}`,
          ResultCode: 0,
          ResultDesc: "The service request is processed successfully.",
          CallbackMetadata: {
            Item: [
              { Name: "Amount", Value: amount || 10 },
              { Name: "MpesaReceiptNumber", Value: `TEST${Date.now()}` },
              { Name: "TransactionDate", Value: new Date().toISOString() },
              { Name: "PhoneNumber", Value: phoneNumber || "254700000000" },
            ],
          },
        },
      },
    }

    console.log("[Test Callback] Simulating:", simulatedCallback)

    const result = await processCallback(simulatedCallback)

    return NextResponse.json({
      message: "Callback simulated",
      result,
      simulatedData: simulatedCallback.Body.stkCallback,
    })
  } catch (error) {
    console.error("[Test Callback] Error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

export async function GET() {
  // Only allow in development
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "This endpoint is disabled in production" },
      { status: 403 }
    )
  }

  try {
    // List pending transactions (no orderBy to avoid index requirement)
    const pending = await db
      .collection("mpesa_transactions")
      .where("status", "==", "pending")
      .limit(10)
      .get()

    const transactions = pending.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    return NextResponse.json({
      message: "Pending M-Pesa transactions",
      count: transactions.length,
      transactions,
    })
  } catch (error) {
    console.error("[Test Callback GET] Error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
