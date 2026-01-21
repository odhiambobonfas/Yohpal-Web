/**
 * M-Pesa OAuth Token Generation
 * Handles authentication with Safaricom Daraja API
 */

import { mpesaConfig } from "./config"
import { MpesaOAuthResponse } from "./types"

// Token cache to avoid requesting new token on every request
let cachedToken: string | null = null
let tokenExpiry: number = 0

/**
 * Get OAuth access token from Safaricom
 * Tokens are cached and reused until expiry
 */
export async function getAccessToken(): Promise<string> {
  // Return cached token if still valid (with 60 second buffer)
  const now = Date.now()
  if (cachedToken && tokenExpiry > now + 60000) {
    return cachedToken
  }

  const { consumerKey, consumerSecret, authUrl } = mpesaConfig

  // Create Base64 encoded credentials
  const credentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString(
    "base64"
  )

  const response = await fetch(`${authUrl}?grant_type=client_credentials`, {
    method: "GET",
    headers: {
      Authorization: `Basic ${credentials}`,
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Failed to get M-Pesa access token: ${errorText}`)
  }

  const data: MpesaOAuthResponse = await response.json()

  // Cache the token
  cachedToken = data.access_token
  // Parse expires_in (usually "3599" seconds) and convert to milliseconds
  tokenExpiry = now + parseInt(data.expires_in) * 1000

  return data.access_token
}

/**
 * Generate timestamp in format YYYYMMDDHHmmss
 */
export function generateTimestamp(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  const hours = String(now.getHours()).padStart(2, "0")
  const minutes = String(now.getMinutes()).padStart(2, "0")
  const seconds = String(now.getSeconds()).padStart(2, "0")

  return `${year}${month}${day}${hours}${minutes}${seconds}`
}

/**
 * Generate password for STK Push
 * Password = Base64(Shortcode + Passkey + Timestamp)
 */
export function generatePassword(timestamp: string): string {
  const { shortcode, passkey } = mpesaConfig
  return Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64")
}
