# Account Manager Migration Documentation

**Date:** January 16, 2025
**Status:** In Progress
**Migration:** PHP/Bootstrap → Next.js/Shadcn-ui

---

## Overview

Migration of the YohPal Account Manager from a separate PHP/Bootstrap site (`https://accountmanager.yohpal.com`) into the main Yohpal-Web Next.js application as an internal page at `/account`.

---

## Completed Features

### 1. Route Structure ✅

```
app/(yohpal)/account/
├── layout.tsx              # Account section layout with tab navigation
├── page.tsx                # Dashboard (main overview)
├── deposit/page.tsx        # Deposit funds (M-Pesa)
├── withdraw/page.tsx       # Withdraw earnings
├── network/page.tsx        # Referrals network
├── transactions/page.tsx   # Transaction history
└── loading.tsx             # Shared loading skeleton
```

### 2. API Routes ✅

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/account/balance` | GET | Fetch user balance, earnings, network size from Firestore |
| `/api/account/deposit` | POST | Initiate M-Pesa STK push via backend API |
| `/api/account/withdraw` | POST | Process B2C withdrawal via backend API |
| `/api/account/transactions` | GET | Fetch transaction history with filters |
| `/api/account/referrals` | GET | Fetch referral network (primary/secondary) |

**Backend APIs Integrated:**
- Deposit: `https://yohpal-apis.onrender.com/deposit/`
- Withdraw: `https://yohpal-apis.onrender.com/withdraw/`
- Transactions: `https://yohpal-apis-test.onrender.com/transactionHistory/{userId}`

### 3. TypeScript Types ✅

Created `types/account.ts` with interfaces for:
- `AccountBalance` - Balance and stats data
- `Transaction` - Transaction records
- `TransactionFilters` - Filter options
- `DepositRequest/Response` - Deposit API types
- `WithdrawRequest/Response` - Withdrawal API types
- `Referral` - Referral user data
- `NetworkStats` - Network statistics
- `ApiResponse<T>` - Generic API response wrapper

### 4. Custom Hooks ✅

Created `hooks/account/` with:

| Hook | Purpose |
|------|---------|
| `useAccountBalance()` | Fetch and cache user balance |
| `useTransactions()` | Fetch transactions with filtering/pagination |
| `useReferrals()` | Fetch referral network with filtering |
| `useDeposit()` | Handle deposit mutation |
| `useWithdraw()` | Handle withdrawal mutation |

### 5. UI Components ✅

```
components/custom/account/
├── AccountNavTabs.tsx              # Tab navigation between sections
├── dashboard/
│   ├── StatsCards.tsx              # Balance, Earnings, Network stats cards
│   ├── EarningsBreakdown.tsx       # Referral vs Bonus earnings chart
│   ├── QuickActions.tsx            # Quick action buttons
│   └── RecentTransactions.tsx      # Last 5 transactions preview
├── deposit/
│   └── DepositForm.tsx             # Phone + Amount form with quick amounts
├── withdraw/
│   └── WithdrawForm.tsx            # Withdrawal form with balance check
├── network/
│   ├── NetworkStats.tsx            # Primary/Secondary referral counts
│   ├── ReferralCodeCard.tsx        # Copy code, share via WhatsApp
│   └── ReferralsList.tsx           # Paginated referrals table
└── transactions/
    ├── TransactionFilters.tsx      # Type/Status filter dropdowns
    └── TransactionTable.tsx        # Full transaction history table
```

### 6. Sidebar Integration ✅

Updated `components/custom/AppSidebar.tsx`:
- Changed Account Manager link from external URL to internal `/account` route
- Added prefetch for faster navigation

### 7. Environment Configuration ✅

Created `.env.local` with:
```bash
# Firebase Client (Browser)
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID

# Firebase Admin (Server)
FIREBASE_CLIENT_EMAIL
FIREBASE_PRIVATE_KEY
FIREBASE_DB_URL

# Account Manager APIs
YOHPAL_ACCOUNT_API_URL
YOHPAL_TRANSACTIONS_API_URL

# Redis (optional)
REDIS_URL
REDIS_PORT
REDIS_USERNAME
REDIS_PASSWORD
```

---

## Yet to be Completed

### 1. Backend API Integration Testing 🔄

| Task | Status | Notes |
|------|--------|-------|
| Test M-Pesa STK push flow | Pending | Need to verify with real M-Pesa sandbox |
| Test B2C withdrawal flow | Pending | Need to verify with real M-Pesa sandbox |
| Test transaction history API | Pending | Verify data format from backend |
| Handle API error responses | Pending | Add proper error messages for each failure case |

### 2. Firestore Data Structure 🔄

The API routes assume certain Firestore collections exist:

| Collection | Fields Expected | Status |
|------------|-----------------|--------|
| `users` | `referralCode`, `refererCode`, `pendingBalance` | Verify exists |
| `transactions` | `userId`, `type`, `amount`, `status`, `createdAt` | May need to create |

**Action Required:** Verify these collections exist in Firestore or create them.

### 3. Authentication Flow 🔄

| Task | Status |
|------|--------|
| Verify user session on account pages | Uses existing auth |
| Redirect to login if not authenticated | Handled by middleware |
| Test with actual logged-in user | Pending |

### 4. Real-time Updates 🔄

| Feature | Status | Implementation |
|---------|--------|----------------|
| Transaction status updates | Not implemented | Consider WebSocket or polling |
| Balance refresh after deposit | Manual refresh only | Add auto-refresh after success |
| STK push callback handling | Backend responsibility | Verify backend handles callbacks |

### 5. Support Page 🔴

Not migrated yet. Lower priority as per original plan.

| Task | Status |
|------|--------|
| Support ticket submission | Not started |
| Support history view | Not started |
| FAQ section | Not started |

### 6. Additional Polish 🔄

| Task | Status |
|------|--------|
| Add confirmation dialogs for deposit/withdraw | Partial (toast only) |
| Add transaction receipt/details view | Not implemented |
| Add export transactions to CSV | Not implemented |
| Mobile responsive testing | Needs verification |
| Dark mode testing | Needs verification |

---

## Issues Encountered & Resolutions

### Issue 1: ESLint Naming Convention Error

**Error:**
```
Parameter name `_` must match one of the following formats: camelCase, PascalCase, UPPER_CASE
```

**Cause:** Using `_` as unused parameter in `.map()` callbacks.

**Resolution:** Changed `_` to `unused` in all skeleton loading components:
```typescript
// Before
Array.from({ length: 4 }).map((_, i) => ...)

// After
Array.from({ length: 4 }).map((unused, i) => ...)
```

**Files Fixed:**
- `app/(yohpal)/account/loading.tsx`
- `components/custom/account/dashboard/StatsCards.tsx`
- `components/custom/account/dashboard/EarningsBreakdown.tsx`
- `components/custom/account/dashboard/RecentTransactions.tsx`
- `components/custom/account/network/NetworkStats.tsx`
- `components/custom/account/network/ReferralsList.tsx`
- `components/custom/account/transactions/TransactionTable.tsx`

---

### Issue 2: TypeScript Navigator.share Error

**Error:**
```
This condition will always return true since this function is always defined
```

**Cause:** Checking `navigator.share &&` always returns true because it's a function reference.

**Resolution:** Used `useEffect` to check for Web Share API support:
```typescript
const [canShare, setCanShare] = useState(false)

useEffect(() => {
  setCanShare(typeof navigator !== "undefined" && "share" in navigator)
}, [])
```

**File Fixed:** `components/custom/account/network/ReferralCodeCard.tsx`

---

### Issue 3: Redis Configuration Required

**Error:**
```
Error: Missing redis configuration
```

**Cause:** `lib/redis.ts` threw an error if Redis env vars were not set.

**Resolution:** Made Redis optional by changing the initialization:
```typescript
// Before
if (!process.env.REDIS_URL || !process.env.REDIS_PORT) {
    throw new Error("Missing redis configuration")
}

// After
let redis: Redis | null = null

if (process.env.REDIS_URL && process.env.REDIS_PORT) {
    redis = new Redis(...)
} else {
    console.warn("[REDIS]: Missing configuration, caching disabled")
}
```

**Files Fixed:**
- `lib/redis.ts` - Made initialization optional
- `actions/videos/comment-cache-mut.ts` - Added null checks
- `actions/videos/video-stats-cache-mut.ts` - Added null checks

---

### Issue 4: Firebase Admin Configuration

**Error:**
```
Error: [ENV ERR]: Invalid .env configuration for firebase admin
```

**Cause:** Missing Firebase Admin SDK credentials in `.env.local`.

**Resolution:** Added required environment variables:
```bash
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxx@project.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_DB_URL="https://project.firebaseio.com"
```

---

## Tomorrow's Action Items

### High Priority

1. **Test with Real User Session**
   - Log in to the app
   - Navigate to `/account`
   - Verify balance loads correctly
   - Test deposit/withdraw forms

2. **Verify Firestore Collections**
   - Check if `transactions` collection exists
   - Verify field names match API expectations
   - Create test transaction documents if needed

3. **Test M-Pesa Integration**
   - Use M-Pesa sandbox credentials
   - Test STK push flow end-to-end
   - Verify callback handling

### Medium Priority

4. **Add Confirmation Dialogs**
   - Deposit confirmation before STK push
   - Withdraw confirmation with amount display

5. **Error Handling Improvements**
   - Add specific error messages for each API failure
   - Add retry buttons for failed requests
   - Handle network offline state

6. **Mobile Testing**
   - Test all pages on mobile viewport
   - Verify touch interactions
   - Test pull-to-refresh if applicable

### Low Priority

7. **Support Page Migration**
   - Create support ticket form
   - Add FAQ section

8. **Analytics & Monitoring**
   - Add error tracking
   - Add usage analytics for account features

---

## File Summary

### New Files Created (30 files)

```
types/account.ts
app/api/account/balance/route.ts
app/api/account/deposit/route.ts
app/api/account/withdraw/route.ts
app/api/account/transactions/route.ts
app/api/account/referrals/route.ts
hooks/account/useAccountBalance.ts
hooks/account/useTransactions.ts
hooks/account/useReferrals.ts
hooks/account/useDeposit.ts
hooks/account/useWithdraw.ts
hooks/account/index.ts
components/custom/account/AccountNavTabs.tsx
components/custom/account/index.ts
components/custom/account/dashboard/StatsCards.tsx
components/custom/account/dashboard/EarningsBreakdown.tsx
components/custom/account/dashboard/QuickActions.tsx
components/custom/account/dashboard/RecentTransactions.tsx
components/custom/account/deposit/DepositForm.tsx
components/custom/account/withdraw/WithdrawForm.tsx
components/custom/account/network/NetworkStats.tsx
components/custom/account/network/ReferralCodeCard.tsx
components/custom/account/network/ReferralsList.tsx
components/custom/account/transactions/TransactionFilters.tsx
components/custom/account/transactions/TransactionTable.tsx
app/(yohpal)/account/layout.tsx
app/(yohpal)/account/page.tsx
app/(yohpal)/account/deposit/page.tsx
app/(yohpal)/account/withdraw/page.tsx
app/(yohpal)/account/network/page.tsx
app/(yohpal)/account/transactions/page.tsx
app/(yohpal)/account/loading.tsx
```

### Files Modified (4 files)

```
components/custom/AppSidebar.tsx        # Changed external link to /account
lib/redis.ts                            # Made Redis optional
actions/videos/comment-cache-mut.ts     # Added Redis null checks
actions/videos/video-stats-cache-mut.ts # Added Redis null checks
```

### Files Created for Configuration (1 file)

```
.env.local                              # Environment variables
```

---

## Build Status

✅ **Build Successful** (as of January 16, 2025)

```
npm run build - PASSED
npm run dev - Ready for testing
```

**Warning (Expected):**
```
[REDIS]: Missing configuration, caching disabled
```
This is expected when Redis is not configured. The app falls back to Next.js built-in cache.

---

## Contact

For questions about this migration, refer to the original plan or the conversation transcript at:
```
/home/moses/.claude/projects/-home-moses-yohpal/f5f782fe-4b1c-4b68-8f04-1a800f9450c5.jsonl
```
