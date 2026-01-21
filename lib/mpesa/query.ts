/**
 * M-Pesa Transaction Query
 * Query transaction status if callback doesn't arrive
 */

import { mpesaConfig } from "./config"
import { getAccessToken, generateTimestamp, generatePassword } from "./auth"
import { StkQueryRequest, StkQueryResponse } from "./types"

export interface QueryResult {
  success: boolean
  status: "pending" | "completed" | "failed" | "unknown"
  resultCode?: string
  resultDesc?: string
  error?: string
}

/**
 * Query transaction status from Safaricom
 */
export async function queryTransactionStatus(
  checkoutRequestId: string
): Promise<QueryResult> {
  try {
    const accessToken = await getAccessToken()
    const timestamp = generateTimestamp()
    const password = generatePassword(timestamp)

    const queryRequest: StkQueryRequest = {
      BusinessShortCode: mpesaConfig.shortcode,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestId,
    }

    const response = await fetch(mpesaConfig.queryUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(queryRequest),
    })

    const data: StkQueryResponse = await response.json()

    // Interpret result codes
    // ResultCode 0 = Success
    // ResultCode 1032 = Request cancelled by user
    // ResultCode 1037 = DS timeout user cannot be reached
    // ResultCode 2001 = Wrong PIN
    // ResultCode 1 = Insufficient funds

    if (data.ResultCode === "0") {
      return {
        success: true,
        status: "completed",
        resultCode: data.ResultCode,
        resultDesc: data.ResultDesc,
      }
    } else if (data.ResultCode) {
      return {
        success: true,
        status: "failed",
        resultCode: data.ResultCode,
        resultDesc: data.ResultDesc,
      }
    } else if (data.ResponseCode === "0") {
      // Request accepted but no result yet
      return {
        success: true,
        status: "pending",
        resultDesc: "Transaction is still being processed",
      }
    } else {
      return {
        success: false,
        status: "unknown",
        error: data.ResponseDescription || "Unknown error",
      }
    }
  } catch (error) {
    console.error("[M-Pesa Query Error]:", error)
    return {
      success: false,
      status: "unknown",
      error: error instanceof Error ? error.message : "Query failed",
    }
  }
}
