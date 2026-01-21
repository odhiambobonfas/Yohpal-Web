/**
 * M-Pesa Daraja API Configuration
 * All credentials loaded from environment variables
 */

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`[ENV ERR]: Missing required environment variable: ${name}`)
  }
  return value
}

function getEnv(name: string, defaultValue: string): string {
  return process.env[name] || defaultValue
}

export const mpesaConfig = {
  // Credentials
  consumerKey: requireEnv("MPESA_CONSUMER_KEY"),
  consumerSecret: requireEnv("MPESA_CONSUMER_SECRET"),
  passkey: requireEnv("MPESA_PASSKEY"),
  shortcode: requireEnv("MPESA_SHORTCODE"),

  // Callback URL - where M-Pesa sends payment confirmation
  callbackUrl: requireEnv("MPESA_CALLBACK_URL"),

  // API URLs (production by default)
  authUrl: getEnv(
    "MPESA_AUTH_URL",
    "https://api.safaricom.co.ke/oauth/v1/generate"
  ),
  stkUrl: getEnv(
    "MPESA_STK_URL",
    "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
  ),
  queryUrl: getEnv(
    "MPESA_QUERY_URL",
    "https://api.safaricom.co.ke/mpesa/stkpushquery/v1/query"
  ),
} as const

export type MpesaConfig = typeof mpesaConfig
