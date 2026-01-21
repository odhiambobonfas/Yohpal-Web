/**
 * M-Pesa STK Push Implementation
 * Initiates payment prompts on user's phone
 */

import { mpesaConfig } from "./config"
import { getAccessToken, generateTimestamp, generatePassword } from "./auth"
import {
  StkPushRequest,
  StkPushResponse,
  DepositInitiation,
  DepositInitiationResult,
  PendingTransaction,
} from "./types"
import { db } from "@/lib/firebase/firebase.admin"
import { FieldValue } from "firebase-admin/firestore"

/**
 * Format phone number to 254XXXXXXXXX format
 */
export function formatPhoneNumber(phone: string): string {
  let formatted = phone.replace(/\s/g, "").replace(/[^0-9]/g, "")

  if (formatted.startsWith("0")) {
    formatted = "254" + formatted.slice(1)
  } else if (formatted.startsWith("+254")) {
    formatted = formatted.slice(1)
  } else if (!formatted.startsWith("254")) {
    formatted = "254" + formatted
  }

  return formatted
}

/**
 * Validate deposit request
 */
export function validateDeposit(
  request: DepositInitiation
): { valid: boolean; error?: string } {
  const { phoneNumber, amount, userId } = request

  if (!userId) {
    return { valid: false, error: "User ID is required" }
  }

  if (!phoneNumber) {
    return { valid: false, error: "Phone number is required" }
  }

  if (!amount || amount < 10) {
    return { valid: false, error: "Minimum deposit amount is KES 10" }
  }

  if (amount > 150000) {
    return { valid: false, error: "Maximum deposit amount is KES 150,000" }
  }

  // Validate phone number format
  const formatted = formatPhoneNumber(phoneNumber)
  if (!/^254[17]\d{8}$/.test(formatted)) {
    return { valid: false, error: "Invalid phone number format" }
  }

  return { valid: true }
}

/**
 * Initiate STK Push
 */
export async function initiateStkPush(
  request: DepositInitiation
): Promise<DepositInitiationResult> {
  const { phoneNumber, amount, userId } = request

  // Validate request
  const validation = validateDeposit(request)
  if (!validation.valid) {
    return {
      success: false,
      message: validation.error || "Invalid request",
      error: validation.error,
    }
  }

  try {
    // Get OAuth token
    const accessToken = await getAccessToken()

    // Generate timestamp and password
    const timestamp = generateTimestamp()
    const password = generatePassword(timestamp)

    // Format phone number
    const formattedPhone = formatPhoneNumber(phoneNumber)

    // Prepare STK Push request
    const stkRequest: StkPushRequest = {
      BusinessShortCode: mpesaConfig.shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.round(amount),
      PartyA: formattedPhone,
      PartyB: mpesaConfig.shortcode,
      PhoneNumber: formattedPhone,
      CallBackURL: mpesaConfig.callbackUrl,
      AccountReference: userId.slice(0, 12), // Max 12 characters
      TransactionDesc: "YohPal Deposit",
    }

    // Send STK Push request
    const response = await fetch(mpesaConfig.stkUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(stkRequest),
    })

    const data: StkPushResponse = await response.json()

    // Check if STK Push was successfully initiated
    if (data.ResponseCode !== "0") {
      return {
        success: false,
        message: data.ResponseDescription || "Failed to initiate payment",
        error: data.ResponseDescription,
      }
    }

    // Store pending transaction in Firestore
    const pendingTransaction: PendingTransaction = {
      userId,
      amount: Math.round(amount),
      phoneNumber: formattedPhone,
      status: "pending",
      merchantRequestId: data.MerchantRequestID,
      checkoutRequestId: data.CheckoutRequestID,
      createdAt: FieldValue.serverTimestamp(),
    }

    await db
      .collection("mpesa_transactions")
      .doc(data.MerchantRequestID)
      .set(pendingTransaction)

    return {
      success: true,
      message: data.CustomerMessage || "Please check your phone and enter your M-Pesa PIN",
      merchantRequestId: data.MerchantRequestID,
      checkoutRequestId: data.CheckoutRequestID,
    }
  } catch (error) {
    console.error("[M-Pesa STK Push Error]:", error)
    return {
      success: false,
      message: "Failed to initiate payment. Please try again.",
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
