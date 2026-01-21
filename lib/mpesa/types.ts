/**
 * M-Pesa Daraja API Type Definitions
 */

// OAuth Response
export interface MpesaOAuthResponse {
  access_token: string
  expires_in: string
}

// STK Push Request
export interface StkPushRequest {
  BusinessShortCode: string
  Password: string
  Timestamp: string
  TransactionType: "CustomerPayBillOnline" | "CustomerBuyGoodsOnline"
  Amount: number
  PartyA: string // Phone number
  PartyB: string // Shortcode
  PhoneNumber: string
  CallBackURL: string
  AccountReference: string
  TransactionDesc: string
}

// STK Push Response from Safaricom
export interface StkPushResponse {
  MerchantRequestID: string
  CheckoutRequestID: string
  ResponseCode: string
  ResponseDescription: string
  CustomerMessage: string
}

// STK Push Query Request
export interface StkQueryRequest {
  BusinessShortCode: string
  Password: string
  Timestamp: string
  CheckoutRequestID: string
}

// STK Push Query Response
export interface StkQueryResponse {
  ResponseCode: string
  ResponseDescription: string
  MerchantRequestID: string
  CheckoutRequestID: string
  ResultCode: string
  ResultDesc: string
}

// Callback from M-Pesa
export interface MpesaCallback {
  Body: {
    stkCallback: {
      MerchantRequestID: string
      CheckoutRequestID: string
      ResultCode: number
      ResultDesc: string
      CallbackMetadata?: {
        Item: Array<{
          Name: string
          Value: string | number
        }>
      }
    }
  }
}

// Parsed callback metadata
export interface CallbackMetadata {
  amount: number
  mpesaReceiptNumber: string
  transactionDate: string
  phoneNumber: string
}

// Internal types for our application
export interface DepositInitiation {
  phoneNumber: string
  amount: number
  userId: string
}

export interface DepositInitiationResult {
  success: boolean
  message: string
  merchantRequestId?: string
  checkoutRequestId?: string
  error?: string
}

// Pending transaction stored in Firestore
export interface PendingTransaction {
  userId: string
  amount: number
  phoneNumber: string
  status: "pending" | "completed" | "failed"
  merchantRequestId: string
  checkoutRequestId: string
  createdAt: FirebaseFirestore.Timestamp | FirebaseFirestore.FieldValue
  completedAt?: FirebaseFirestore.Timestamp | FirebaseFirestore.FieldValue
  mpesaReceiptNumber?: string
  resultCode?: number
  resultDesc?: string
}

// Completed transaction stored in user's funds collection
export interface CompletedTransaction {
  amount: number
  type: "Deposit"
  package: "Deposit"
  phone: string
  refCode: string // MpesaReceiptNumber
  transactionId: string // MerchantRequestID
  timestamp: FirebaseFirestore.FieldValue
  ResultDesc: string
}
