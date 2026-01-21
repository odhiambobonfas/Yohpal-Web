/**
 * M-Pesa Callback Processing
 * Handles payment confirmation callbacks from Safaricom
 */

import { db } from "@/lib/firebase/firebase.admin"
import { FieldValue } from "firebase-admin/firestore"
import {
  MpesaCallback,
  CallbackMetadata,
  PendingTransaction,
  CompletedTransaction,
} from "./types"

/**
 * Parse callback metadata into structured object
 */
export function parseCallbackMetadata(
  items: Array<{ Name: string; Value: string | number }>
): CallbackMetadata {
  const metadata: Partial<CallbackMetadata> = {}

  for (const item of items) {
    switch (item.Name) {
      case "Amount":
        metadata.amount = Number(item.Value)
        break
      case "MpesaReceiptNumber":
        metadata.mpesaReceiptNumber = String(item.Value)
        break
      case "TransactionDate":
        metadata.transactionDate = String(item.Value)
        break
      case "PhoneNumber":
        metadata.phoneNumber = String(item.Value)
        break
    }
  }

  return metadata as CallbackMetadata
}

/**
 * Process successful payment callback
 * Updates funds collection, user balance, and transaction status
 */
async function processSuccessfulPayment(
  merchantRequestId: string,
  pendingTx: PendingTransaction,
  metadata: CallbackMetadata,
  resultDesc: string
): Promise<void> {
  const { userId, amount } = pendingTx
  const { mpesaReceiptNumber, phoneNumber } = metadata

  // Use a batch write for atomicity
  const batch = db.batch()

  // 1. Create transaction in user's funds collection
  const transactionRef = db
    .collection("funds")
    .doc(userId)
    .collection("transactions")
    .doc()

  const now = new Date()
  const completedTx = {
    amount,
    type: "Deposit",
    package: "Deposit",
    phone: phoneNumber || pendingTx.phoneNumber,
    refCode: mpesaReceiptNumber,
    transactionId: merchantRequestId,
    timestamp: now,
    createdAt: now,
    ResultDesc: resultDesc,
  }

  batch.set(transactionRef, completedTx)

  // 2. Update user's deposit balance in funds collection
  const fundsRef = db.collection("funds").doc(userId)
  batch.set(
    fundsRef,
    { deposit: FieldValue.increment(amount) },
    { merge: true }
  )

  // 3. Update user's balance fields on user document
  const userRef = db.collection("users").doc(userId)
  batch.set(
    userRef,
    {
      totalDeposits: FieldValue.increment(amount),
      availableBalance: FieldValue.increment(amount),
    },
    { merge: true }
  )

  // 4. Update pending transaction status
  const pendingRef = db.collection("mpesa_transactions").doc(merchantRequestId)
  batch.update(pendingRef, {
    status: "completed",
    mpesaReceiptNumber,
    resultCode: 0,
    resultDesc,
    completedAt: FieldValue.serverTimestamp(),
  })

  await batch.commit()
}

/**
 * Process failed payment callback
 */
async function processFailedPayment(
  merchantRequestId: string,
  resultCode: number,
  resultDesc: string
): Promise<void> {
  await db.collection("mpesa_transactions").doc(merchantRequestId).update({
    status: "failed",
    resultCode,
    resultDesc,
    completedAt: FieldValue.serverTimestamp(),
  })
}

/**
 * Main callback processor
 * Called when M-Pesa sends a callback to our endpoint
 */
export async function processCallback(
  callbackData: MpesaCallback
): Promise<{ success: boolean; message: string }> {
  const { stkCallback } = callbackData.Body
  const { MerchantRequestID, CheckoutRequestID, ResultCode, ResultDesc } =
    stkCallback

  console.log("[M-Pesa Callback] Received:", {
    MerchantRequestID,
    CheckoutRequestID,
    ResultCode,
    ResultDesc,
  })

  try {
    // Find the pending transaction
    const pendingRef = db
      .collection("mpesa_transactions")
      .doc(MerchantRequestID)
    const pendingDoc = await pendingRef.get()

    if (!pendingDoc.exists) {
      console.error(
        "[M-Pesa Callback] Transaction not found:",
        MerchantRequestID
      )
      // Still return success to M-Pesa to prevent retries
      return { success: true, message: "Transaction not found" }
    }

    const pendingTx = pendingDoc.data() as PendingTransaction

    // Check if already processed (idempotency)
    if (pendingTx.status !== "pending") {
      console.log(
        "[M-Pesa Callback] Transaction already processed:",
        MerchantRequestID
      )
      return { success: true, message: "Transaction already processed" }
    }

    // Process based on result code
    if (ResultCode === 0) {
      // Payment successful
      if (!stkCallback.CallbackMetadata) {
        throw new Error("Missing callback metadata for successful payment")
      }

      const metadata = parseCallbackMetadata(stkCallback.CallbackMetadata.Item)
      await processSuccessfulPayment(
        MerchantRequestID,
        pendingTx,
        metadata,
        ResultDesc
      )

      console.log("[M-Pesa Callback] Payment successful:", {
        userId: pendingTx.userId,
        amount: pendingTx.amount,
        receipt: metadata.mpesaReceiptNumber,
      })

      return { success: true, message: "Payment processed successfully" }
    } else {
      // Payment failed or cancelled
      await processFailedPayment(MerchantRequestID, ResultCode, ResultDesc)

      console.log("[M-Pesa Callback] Payment failed:", {
        userId: pendingTx.userId,
        resultCode: ResultCode,
        resultDesc: ResultDesc,
      })

      return { success: true, message: "Payment failure recorded" }
    }
  } catch (error) {
    console.error("[M-Pesa Callback] Processing error:", error)
    // Still return success to prevent M-Pesa retries
    // The error is logged for debugging
    return { success: true, message: "Callback received" }
  }
}
