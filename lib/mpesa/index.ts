/**
 * M-Pesa Daraja API Module
 * Central exports for M-Pesa integration
 */

// Configuration
export { mpesaConfig } from "./config"
export type { MpesaConfig } from "./config"

// Authentication
export { getAccessToken, generateTimestamp, generatePassword } from "./auth"

// STK Push
export {
  initiateStkPush,
  formatPhoneNumber,
  validateDeposit,
} from "./stkpush"

// Callback Processing
export { processCallback, parseCallbackMetadata } from "./callback"

// Transaction Query
export { queryTransactionStatus } from "./query"
export type { QueryResult } from "./query"

// Types
export type {
  MpesaOAuthResponse,
  StkPushRequest,
  StkPushResponse,
  StkQueryRequest,
  StkQueryResponse,
  MpesaCallback,
  CallbackMetadata,
  DepositInitiation,
  DepositInitiationResult,
  PendingTransaction,
  CompletedTransaction,
} from "./types"
