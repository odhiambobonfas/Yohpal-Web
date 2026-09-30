# Yohpal Web Application - Complete Documentation

**Generated: February 12, 2026**

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture Overview](#architecture-overview)
4. [Directory Structure](#directory-structure)
5. [Configuration Files](#configuration-files)
6. [Core Application Files](#core-application-files)
7. [Types System](#types-system)
8. [Services Layer](#services-layer)
9. [Actions Layer](#actions-layer)
10. [Hooks System](#hooks-system)
11. [Components](#components)
12. [API Routes](#api-routes)
13. [Authentication & Authorization](#authentication--authorization)
14. [Caching Strategy](#caching-strategy)
15. [Payment Integration](#payment-integration)
16. [Video Management](#video-management)
17. [Advertising System](#advertising-system)
18. [Promotions System](#promotions-system)
19. [PWA Configuration](#pwa-configuration)
20. [Development Notes](#development-notes)

---

## Project Overview

**Yohpal** is a Next.js 16-based video sharing platform with social networking features, monetization capabilities, and advertising systems. It's built as a Progressive Web App (PWA) with support for mobile payments via M-Pesa integration.

### Key Features
- **Video Sharing Platform**: Users can upload, view, and interact with short-form videos
- **Social Features**: Following system, comments, likes, bookmarks, shares, and downloads
- **Monetization**: User accounts with wallet system, referral program, and bonus earnings
- **Advertising**: Business users can create and manage video ads with view-based pricing
- **Video Promotions**: Content creators can promote their videos to wider audiences
- **M-Pesa Integration**: Direct mobile payment integration for deposits
- **PWA Support**: Installable app with offline capabilities
- **Real-time Interactions**: Using Firebase Firestore for real-time data
- **Caching**: Redis and Next.js caching for performance optimization

---

## Technology Stack

### Frontend
- **Next.js 16.1.3**: React framework with App Router
- **React 19.2.3**: UI library
- **TypeScript 5.9.3**: Type safety
- **Tailwind CSS 4.1.18**: Utility-first CSS framework
- **Radix UI**: Unstyled, accessible component library
- **Framer Motion 12.29.2**: Animation library
- **Lucide React**: Icon library
- **SWR 2.3.6**: Data fetching and caching
- **@tanstack/react-virtual 3.13.12**: Virtual scrolling for video feed

### Backend & Database
- **Firebase Admin SDK 13.5.0**: Server-side Firebase operations
- **Firebase Client SDK 12.2.1**: Client-side Firebase operations
- **Firestore**: NoSQL database for data storage
- **Firebase Authentication**: User authentication
- **Firebase Storage**: File storage for videos and images
- **Redis (IORedis 5.8.1)**: Caching layer

### Payment Integration
- **M-Pesa**: Mobile money integration for Kenya and East Africa

### UI Components
- **shadcn/ui**: Pre-built component library (customizable)
- **Vaul 1.1.2**: Drawer component for mobile
- **Sonner 2.0.7**: Toast notifications

### Dev Tools
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Turbopack**: Fast bundler for development

---

## Architecture Overview

The application follows a **layered architecture** pattern:

```
┌─────────────────────────────────────────┐
│         Client Components (UI)          │
│  - React Components                     │
│  - Custom Hooks                         │
│  - Client-side State Management         │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         Server Actions Layer            │
│  - Bridge between client & services     │
│  - Handles mutations                    │
│  - Cache invalidation                   │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         Services Layer                  │
│  Server: Firebase Admin SDK             │
│  Client: Firebase Client SDK            │
│  - Business logic                       │
│  - Database operations                  │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         Data Layer                      │
│  - Firestore (primary database)         │
│  - Redis (caching)                      │
│  - Next.js Cache (static data)          │
└─────────────────────────────────────────┘
```

### Key Architectural Patterns

1. **Server Actions**: Used for mutations from client components
2. **Service Layer**: Centralized database operations
3. **Type Safety**: Comprehensive TypeScript types for all data structures
4. **Caching Strategy**: Multi-tier caching (Redis → Next.js cache → Database)
5. **Separation of Concerns**: Client/Server code clearly separated
6. **Route Groups**: Organized routes using Next.js route groups

---

## Directory Structure

### Root Level Files

#### `package.json`
- **Purpose**: Node.js project manifest
- **Key Dependencies**: Next.js, React, Firebase, Redis, Radix UI, Tailwind
- **Scripts**: 
  - `dev`: Run development server with Turbopack
  - `build`: Production build
  - `start`: Start production server
  - `lint`: Run ESLint

#### `next.config.ts`
- **Purpose**: Next.js configuration
- **Key Features**:
  - Security headers (CSP, X-Frame-Options, HSTS, etc.)
  - PWA configuration using `@ducanh2912/next-pwa`
  - Image optimization settings
  - Remote patterns for Firebase Storage and CDN
  - Webpack configuration to suppress Firestore warnings
  - Turbopack support

#### `middleware.ts`
- **Purpose**: Request middleware for authentication and routing
- **Functionality**:
  - Checks for session cookies (`__auth`, `__u`)
  - Redirects unauthenticated users to login
  - Redirects authenticated users away from auth pages
  - Handles onboarding flow for unverified emails
  - Redirects legacy PHP routes to new routes
  - Protected routes: `/profile`, `/auth/*`, `/`, `/onboarding`, `/account/*`

#### `tsconfig.json`
- **Purpose**: TypeScript configuration
- **Path Aliases**: 
  - `@/*`: Maps to project root
  - `#/*`: Maps to types directory

#### `eslint.config.mjs`
- **Purpose**: ESLint configuration for code quality

#### `postcss.config.mjs`
- **Purpose**: PostCSS configuration for Tailwind CSS

#### `components.json`
- **Purpose**: shadcn/ui configuration for component generation

#### `TODO.md`
- **Purpose**: Development notes, TODOs, and architectural decisions
- **Key Notes**:
  - Explanation of promoted content structure
  - Redis implementation strategy
  - Comment deletion strategy (soft deletes)
  - Development optimizations

---

## Core Application Files

### `/app` Directory

The App Router structure for Next.js 16. Uses route groups for organization.

#### `app/layout.tsx`
- **Purpose**: Root layout for entire application
- **Features**:
  - Font configuration (Geist Sans, Geist Mono)
  - Theme provider (light/dark mode)
  - Auth provider (global authentication state)
  - Toast notifications (Sonner)
  - Global CSS imports
  - SEO metadata

#### `app/globals.css`
- **Purpose**: Global styles and CSS variables
- **Includes**: Tailwind base, components, utilities, and custom CSS variables

#### `app/not-found.tsx`
- **Purpose**: 404 error page

#### `app/manifest.ts`
- **Purpose**: PWA manifest configuration for app installation

### Route Groups

#### `app/(yohpal)` - Main Application Routes
- **Purpose**: Core application features (video feed, user profiles, etc.)
- **Layout**: `app/(yohpal)/layout.tsx`
  - Sidebar navigation (AppSidebar)
  - Header with user dropdown
  - Persistent layout for authenticated users
  
**Pages**:
- **`page.tsx`**: Home/Landing page - video feed
  - Fetches landing videos with promoted content
  - Implements blocked user filtering
  - Server-side rendering with video data
  - Renders `PlayerCanvas` component

- **`account/`**: User account management
  - Balance, transactions, deposits, referrals
  
- **`following/`**: Feed of videos from followed users

- **`onboarding/`**: New user onboarding flow

- **`profile/`**: User's own profile page

- **`tag/`**: Videos filtered by tags

- **`user/`**: Public user profile pages

- **`error.tsx`**: Error boundary for this route group

#### `app/(organization)` - Organization Pages
- **Purpose**: Static/informational pages about the company
- **Layout**: `app/(organization)/layout.tsx`
  - Simple header navigation
  - No sidebar

**Pages**:
- **`about/`**: About Yohpal
- **`privacy/`**: Privacy policy
- **`terms/`**: Terms of service

#### `app/auth` - Authentication Routes
**Pages**:
- **`login/page.tsx`**: User login
  - Email/password authentication
  - Session cookie creation
  - Return URL handling for redirects
  - Auto-login for existing sessions
  
- **`register/`**: User registration
- **`forgot-password/`**: Password recovery

#### `app/worker/sw.js`
- **Purpose**: Service Worker for PWA functionality
- **Features**:
  - Precaches app shell (/, /app/**, /icons/**, etc.)
  - Cache-first strategy for navigation
  - Network fallback for assets
  - Version management (CACHE_NAME: "app-shell-v1")

---

## API Routes

Located in `app/api/`, these are Next.js Route Handlers (server-side endpoints).

### `app/api/account/`
- **Purpose**: Account-related operations
- **Endpoints**:
  - `balance`: Get user account balance
  - `transactions`: Transaction history
  - `deposit`: Initiate deposits
  - `referrals`: Referral network data

### `app/api/ads/`
- **Purpose**: Advertising system endpoints
- **Endpoints**:
  - `GET`: List user's ads
  - `POST`: Create new ad (draft)
  - `[id]/publish`: Publish ad with budget
  - `[id]/republish`: Republish depleted ad
  - `[id]/stats`: Ad performance statistics
  - `wallet`: Ad wallet balance
  - `transactions`: Ad spending history
  - `deposit`: Deposit to ad wallet

### `app/api/promotions/`
- **Purpose**: Video promotion system
- **Endpoints**:
  - `GET`: List user's promotions
  - `POST`: Create video promotion
  - `[id]`: Get/update/delete specific promotion
  - `[id]/publish`: Publish promotion with budget
  - `[id]/republish`: Republish promotion

### `app/api/mpesa/`
- **Purpose**: M-Pesa payment integration
- **Files**:
  - **`callback/route.ts`**: M-Pesa callback handler
    - Receives payment confirmations from Safaricom
    - Always returns 200 OK to prevent retries
    - Processes payment asynchronously
    - Updates transaction status in database

### `app/api/proxy/`
- **Purpose**: Proxy endpoints for external services

### `app/api/all/route.ts`
- **Purpose**: Debug endpoint (DEV only)
- **Functionality**: Returns all non-broken videos (for testing)

---

## Types System

Located in `/types`, provides TypeScript definitions for the entire application.

### `types/base.ts`
```typescript
// Core Firebase types
export interface FirebaseTimestamp {
  seconds: number
  nanoseconds: number
}
```

### `types/videos.ts`
**Key Interfaces**:
- **`Video`**: Base video data structure
  - `id`, `userId`, `userName`, `fullName`
  - `videoUrl`, `thumbnail`
  - `title`, `caption`, `tags`
  - `privacy`, `allowComments`, `broken`
  - `promoted`, `campaignMeta`
  - `viewsCount`, `likesCount`

- **`VideoWithStats`**: Video with interaction statistics
  - Extends `Video`
  - `downloads[]`, `shares[]`, `views[]`, `likes[]`, `bookmarks[]`
  - `comments[]`

- **`CampaignMeta`**: Promoted video metadata
  - `promotionId`, `newVideoUrl`, `newThumbnailUrl`, `timestamp`

- **`VideoComment`**: Comment structure
  - `id`, `msg`, `userId`, `username`, `profile_picture`
  - `likes`, `replies`, `hasReply`, `isReply`
  - `videoId`, `userHasLiked`, `deleted`
  - `timestamp`

- **`VideoInteraction`**: User interaction with video
  - `userId`, `videoId`, `promoted`

### `types/users.ts`
**Key Interfaces**:
- **`YPUser`**: User profile
  - `uid`, `email`, `userName`, `firstName`, `lastName`
  - `phoneNumber`, `profile_picture`, `bio`, `Country`
  - `refererCode`, `referralCode`
  - `followersCount`, `followingCount`
  - `contentPreferences[]`
  - `businessProfile?`
  - Balance fields: `totalDeposits`, `availableBalance`, `referralEarnings`, `bonusEarnings`

- **`BusinessProfile`**: Business account data
  - `businessName`, `businessDescription`, `businessLogo`
  - `contactInfo`, `category`
  - `verificationStatus`: "pending" | "verified" | "rejected" | "unverified"

### `types/account.ts`
**Key Interfaces**:
- **`AccountBalance`**: User wallet balance
  - `totalDeposits`, `totalEarnings`, `availableBalance`, `pendingBalance`
  - `totalSpentOnAds`, `referralEarnings`, `bonusEarnings`

- **`Transaction`**: Transaction record
  - `id`, `userId`, `type`, `amount`, `status`
  - `description`, `reference`, `phoneNumber`
  - `createdAt`, `completedAt`

- **`Referral`**: Referral network member
  - User info, `level` (primary/secondary), `totalEarned`, `isActive`

- **`NetworkStats`**: Referral network statistics

### `types/ads.ts`
**Key Interfaces**:
- **`Ad`**: Advertisement structure
  - `id`, `userId`, `businessId?`
  - `imageUrl`, `description?`
  - `amountAllocated`, `viewsGenerated`
  - `isPublished`, `isDepleted`
  - `viewFrequency`: 1-5 times per day
  - `createdAt`, `updatedAt`

- **`AdStats`**: Ad performance metrics
  - `views`, `totalTimeSeconds`, `totalSpent`

- **`AdTransaction`**: Ad wallet transaction
  - Types: "deposit" | "ad_spend" | "ad_publish" | "ad_republish"

- **`AdWalletBalance`**: Ad wallet balance
  - `balance`, `totalDeposited`, `totalSpent`

---

## Services Layer

Located in `/services`, handles all database operations.

### Directory Structure
```
services/
├── index.ts          # Service exports
├── client/           # Firebase Client SDK operations
│   ├── auth.ts
│   ├── user.ts
│   ├── video.ts
│   ├── file-upload.ts
│   ├── user-mutations.ts
│   ├── video-report-mutation.ts
│   └── org/
└── server/           # Firebase Admin SDK operations
    ├── videos.ts
    ├── user.ts
    ├── video-interactions.ts
    └── ...
```

### `services/server/videos.ts`
**Key Functions**:
- `getLandingVideos()`: Fetch initial video feed
  - Handles specific video/user queries
  - Returns paginated videos with stats
  - Implements blocked user filtering
  
- `getVideoStats()`: Get interaction stats for a video
- `getVideosFromProfile()`: User-specific video feed
- Video interaction handlers (likes, bookmarks, shares, downloads)

### `services/client/user.ts`
- Client-side user operations
- `getWatchedVideos()`: Fetch user's watch history

### Firebase Configuration

#### `lib/firebase/firebase.admin.ts`
- **Purpose**: Firebase Admin SDK initialization (server-only)
- **Configuration**: Service account credentials from environment variables
- **Exports**: 
  - `firebaseAdmin`: Admin app instance
  - `db`: Firestore instance
  - `auth`: Admin auth instance
  - `serverTimestamp`: Server timestamp function

#### `lib/firebase/firebase.browser.ts`
- **Purpose**: Firebase Client SDK initialization (browser)
- **Configuration**: Client credentials from environment variables
- **Exports**:
  - `app`: Firebase app instance
  - `db`: Firestore instance
  - `auth`: Firebase Auth instance
  - `storage`: Firebase Storage instance

---

## Actions Layer

Located in `/actions`, provides server actions for client-server communication.

### Purpose
Server Actions bridge client components to server-side services, handling:
1. Mutations (create, update, delete)
2. Cache invalidation
3. Error handling
4. Decoupling client from database operations

### Key Files

#### `actions/session.ts`
- `createSession()`: Create authentication session cookie
- `deleteSession()`: Clear session cookie

#### `actions/cookies.ts`
- Cookie management utilities

#### `actions/users/user-interaction.ts`
- User follow/unfollow actions
- User blocking/reporting

#### `actions/videos/video-interactions.ts`
**Functions**:
- `likeVideoAction()`: Like a video
- `unlikeVideoAction()`: Unlike a video
- `bookmarkVideoAction()`: Bookmark video
- `unbookmarkVideoAction()`: Remove bookmark
- `downloadVideoAction()`: Track download
- `shareVideoAction()`: Track share
- `updateViewAction()`: Track view

**Pattern**: Each action calls both:
1. Cache mutation (Redis) - immediate feedback
2. Database operation - persistent storage

#### `actions/videos/comments.ts`
- Comment creation, deletion, likes

#### `actions/videos/promoted-videos.ts`
- `getPromotedVideosAction()`: Fetch promoted videos

#### `actions/videos/comment-cache-mut.ts`
- Redis cache operations for comments

#### `actions/videos/video-stats-cache-mut.ts`
- Redis cache operations for video statistics
- Optimistic updates for instant UI feedback

---

## Hooks System

Located in `/hooks`, provides reusable React hooks for common operations.

### Structure
```
hooks/
├── use-mobile.ts              # Mobile device detection
├── account/                   # Account-related hooks
│   ├── index.ts
│   ├── useAccountBalance.ts
│   ├── useDeposit.ts
│   ├── useDepositStatus.ts
│   ├── useEditProfile.ts
│   ├── useOnboardingForm.ts
│   ├── useReferrals.ts
│   └── useTransactions.ts
├── ads/                       # Advertising hooks
│   ├── index.ts
│   ├── useAd.ts
│   ├── useAds.ts
│   ├── useCreateAd.ts
│   ├── usePublishAd.ts
│   └── ...
├── auth/                      # Authentication hooks
│   └── use-email-auth.ts
├── promotions/                # Video promotion hooks
│   ├── useCreatePromotion.ts
│   ├── useDeletePromotion.ts
│   └── ...
├── user/                      # User management hooks
├── videos/                    # Video-related hooks
│   ├── use-auto-pause-video.ts
│   ├── use-following-videos.ts
│   ├── use-optimistic-video.ts
│   ├── use-video-handlers.ts
│   ├── use-video-mutations.ts
│   └── use-video.ts
```

### Example Hooks

#### `hooks/account/useAccountBalance.ts`
```typescript
export function useAccountBalance() {
  // Fetches and manages account balance state
  // Returns: { balance, loading, error, refetch }
}
```

#### `hooks/ads/useAds.ts`
```typescript
export function useAds(options: UseAdsOptions) {
  // Fetches paginated ads with filtering
  // Options: page, limit, filter (all/draft/published/depleted)
  // Returns: { ads, loading, error, total, totalPages, hasMore, refetch }
}
```

#### `hooks/promotions/useCreatePromotion.ts`
```typescript
export function useCreatePromotion() {
  // Creates video promotion
  // Returns: { createPromotion, loading, error, success, createdPromotion, reset }
}
```

#### `hooks/auth/use-email-auth.ts`
- `login()`: Email/password login
- `register()`: User registration
- `logout()`: Sign out

---

## Components

Located in `/components`, organized into UI and custom components.

### Structure
```
components/
├── ui/                        # shadcn/ui components
│   ├── alert.tsx
│   ├── avatar.tsx
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── input.tsx
│   ├── sidebar.tsx
│   └── ...
└── custom/                    # Project-specific components
    ├── AppSidebar.tsx
    ├── ClientOnly.tsx
    ├── DebugWindow.tsx
    ├── account/
    ├── app/
    │   ├── UserDropDown.tsx
    │   ├── KeyShortcuts.tsx
    │   └── video/
    │       ├── PlayerCanvas.tsx
    │       ├── VideoPlayer.tsx
    │       ├── MobileInteractions.tsx
    │       └── DesktopPlayerInteractions.tsx
    └── orgarnization/
        └── NavHeader.tsx
```

### Key Custom Components

#### `components/custom/AppSidebar.tsx`
- **Purpose**: Main navigation sidebar
- **Features**:
  - Home, Following, About, Privacy, Terms links
  - Wallet link for authenticated users
  - Responsive (collapsible)
  - User profile section in footer

#### `components/custom/app/video/PlayerCanvas.tsx`
- **Purpose**: Main video player container with infinite scroll
- **Features**:
  - Virtual scrolling using @tanstack/react-virtual
  - Infinite scroll (pagination)
  - Promoted video injection
  - Blocked user filtering
  - Video prefetching
  - Keyboard shortcuts support
  - Mobile/desktop interaction handlers
  - Active video tracking
  - Auto-fetch next batch when approaching end

**Key Functions**:
- `moveNext()`: Navigate to next video
- `movePrev()`: Navigate to previous video
- Handles video data fetching and state management

#### `components/custom/app/video/VideoPlayer.tsx`
- Individual video player component
- Video controls, interactions overlay

#### `components/custom/app/video/MobileInteractions.tsx`
- Mobile-optimized interaction buttons (like, comment, share, etc.)

#### `components/custom/app/video/DesktopPlayerInteractions.tsx`
- Desktop interaction panel

#### `components/custom/ClientOnly.tsx`
- **Purpose**: Wrapper for client-only rendering
- Prevents hydration mismatches

#### `components/custom/DebugWindow.tsx`
- Debug information display (dev mode only)

### UI Components (`components/ui/`)
Pre-built shadcn/ui components, customized with Tailwind:
- **Forms**: Input, Label, Select, Checkbox, Switch, Textarea
- **Feedback**: Alert, Dialog, Toast (Sonner), Progress
- **Navigation**: Dropdown Menu, Tabs, Sidebar
- **Display**: Avatar, Badge, Card, Separator, Skeleton
- **Overlay**: Drawer (Vaul), Tooltip, Sheet, Alert Dialog

---

## Constants

Located in `/constants/index.ts`, centralizes all app-wide constants.

### Key Constants

#### URLs & Assets
```typescript
DEFAULT_THUMBNAIL = "/app/default_thumbnail.jpg"
DEFAULT_PROFILE = "/logo_circular.png"
CDN_URL = "https://cdn.stream.yohpal.com/"
OLD_URL = "https://firebasestorage.googleapis.com/..."
```

#### Cookies
```typescript
COOKIES = {
  Session: "__auth",
  EmailNotVerified: "__emailVerified",
  User: "__u",
}
```

#### Content & Features
```typescript
INTERESTS = ["Kids", "Politics & News", "Sports & Talents", ...]
SUPPORTED_COUNTRIES = ["Kenya", "Tanzania", "Uganda", ...]
VIDEO_LIMIT = 30 (prod) / 10 (dev)
PROMOTED_VIDEOS_LIMIT = Math.ceil(VIDEO_LIMIT / 4)
CACHE_TTL = 3600 // seconds
```

#### Advertising
```typescript
AD_COST_PER_VIEW = 1 // KES per view
AD_VIEW_DURATION_SECONDS = 15
AD_MIN_PUBLISH_AMOUNT = 20 // KES
AD_MIN_DEPOSIT = 10 // KES
AD_FREQUENCY_BASE = 5 // Show ad every N videos
AD_VIEW_FREQUENCY_OPTIONS = [1, 2, 3, 4, 5] // times per day
```

#### Development
```typescript
DEBUG_BUILD = process.env.NODE_ENV === "development"
```

---

## Authentication & Authorization

### Flow

1. **Login** (`app/auth/login/page.tsx`):
   - User enters email/password
   - Firebase Authentication validates credentials
   - On success, creates session via `createSession()` action
   - Sets cookies: `__auth` (session token), `__u` (user ID)
   - Redirects to return URL or home

2. **Middleware** (`middleware.ts`):
   - Runs on every request
   - Checks for `__auth` and `__u` cookies
   - Redirects if:
     - Not authenticated → `/auth/login`
     - Authenticated but on auth pages → `/`
     - Email not verified → `/onboarding`

3. **Auth Provider** (`providers/Auth.tsx`):
   - React Context for auth state
   - Monitors Firebase auth state changes
   - Fetches user profile on authentication
   - Provides: `user`, `profile`, `loading`, `isAuthenticated`, `refreshProfile()`

4. **Session Management** (`actions/session.ts`):
   - `createSession()`: Verify token, set cookies
   - `deleteSession()`: Clear cookies, sign out

### Protected Routes
Configured in `middleware.ts`:
- `/profile`
- `/auth/*` (redirect if authenticated)
- `/`
- `/onboarding`
- `/account/*`

---

## Caching Strategy

Multi-tier caching for optimal performance.

### 1. Redis Cache (`lib/redis.ts`)
- **When**: Production environment with Redis configured
- **TTL**: 3600 seconds (1 hour)
- **Use Cases**: Video data, user profiles, statistics

### 2. Next.js Unstable Cache
- **When**: Redis unavailable or as fallback
- **TTL**: 3600 seconds
- **Use Cases**: Same as Redis

### 3. SWR (Client-side)
- **When**: Client-side data fetching
- **Features**: Automatic revalidation, deduplication, error retry
- **Use Cases**: User-initiated data fetches, real-time updates

### Cache Helper (`lib/cache.ts`)

```typescript
export async function withCache<T>(fn: () => Promise<T>, key: string) {
  // 1. Try Redis
  // 2. Fallback to Next.js cache
  // 3. Execute function and cache result
}
```

### Cache Invalidation
Handled in server actions:
- Video interactions → Invalidate video stats cache
- User updates → Invalidate user profile cache
- Comment operations → Invalidate comment cache

---

## Payment Integration

### M-Pesa Integration

Located in `lib/mpesa/` (implementation details in service layer).

#### Deposit Flow

1. **User initiates deposit**:
   - Calls `/api/account/deposit` or `/api/ads/deposit`
   - Provides: `phoneNumber`, `amount`

2. **Server sends STK Push**:
   - Uses M-Pesa API to send payment prompt to user's phone
   - Creates transaction record (status: "pending")
   - Returns `transactionId` and `checkoutRequestId`

3. **User confirms payment on phone**:
   - M-Pesa processes payment

4. **M-Pesa calls callback**:
   - POST to `/api/mpesa/callback`
   - Receives payment result
   - Updates transaction status
   - Credits user account

5. **Client polls for status**:
   - Uses `useDepositStatus()` hook
   - Polls transaction status until complete

#### Transaction Types
- **Account deposits**: Credit `availableBalance`
- **Ad deposits**: Credit ad wallet balance
- **Referral earnings**: Auto-credited to `referralEarnings`
- **Bonus earnings**: Auto-credited to `bonusEarnings`

---

## Video Management

### Video Feed Architecture

#### Main Feed (`app/(yohpal)/page.tsx`)
1. **Server-side data fetch**:
   - Fetch initial videos (30 in prod, 10 in dev)
   - Fetch promoted videos (25% of VIDEO_LIMIT)
   - Filter blocked users
   - Check for specific video/user query params

2. **Client-side rendering** (`PlayerCanvas`):
   - Virtual scrolling (7 videos in DOM at once)
   - Infinite scroll pagination
   - Inject promoted videos at intervals
   - Track active video
   - Prefetch user profiles

3. **Interactions**:
   - Like, bookmark, share, download, comment
   - Optimistic updates (Redis cache)
   - Persistent storage (Firestore)

### Video Storage Structure (Firestore)

```
videos/
  {videoId}/
    - metadata (title, caption, tags, etc.)
    - interactions/
      - likes/{userId}
      - bookmarks/{userId}
      - views/{userId}
      - shares/{userId}
      - downloads/{userId}
    - comments/{commentId}
    - campaign_stats/ (for promoted videos)
      - PROMOTED/
        - views/{userId}
        - likes/{userId}
        ...
```

### Video CDN
Videos stored in Firebase Storage, served via CDN:
- Old URL: `firebasestorage.googleapis.com`
- New CDN: `cdn.stream.yohpal.com`
- Utility: `replaceWithCDN()` in `lib/utils.ts`

---

## Advertising System

### Overview
Businesses can create image-based ads shown between videos.

### Ad Lifecycle

1. **Create Ad (Draft)**:
   - Upload image (landscape format)
   - Add description (max 100 chars)
   - Status: `isPublished: false`

2. **Publish Ad**:
   - Deposit to ad wallet
   - Allocate budget (min 20 KES)
   - Set view frequency (1-5 times/day per user)
   - Status: `isPublished: true`

3. **Ad Display**:
   - Shown every N videos (AD_FREQUENCY_BASE = 5)
   - Respects view frequency limit
   - Tracks view duration (15 seconds = 1 view)
   - Deducts 1 KES per view

4. **Ad Depletion**:
   - When budget exhausted: `isDepleted: true`
   - No longer shown
   - Can be republished with new budget

5. **Republish**:
   - Add more budget
   - Optionally change view frequency
   - Resets `isDepleted: false`
   - Cumulative `viewsGenerated` continues

### Ad Wallet
Separate wallet for ad spending:
- Balance: Available funds for ads
- Transactions: Track deposits and spending
- Managed via `/api/ads/wallet` and `/api/ads/transactions`

### Pricing
- **Cost**: 1 KES per view
- **View**: 15 seconds of ad display
- **Minimum Publish**: 20 KES (20 views)
- **Minimum Deposit**: 10 KES

---

## Promotions System

### Overview
Content creators can promote their own videos for increased visibility.

### Video Promotion Lifecycle

1. **Create Promotion**:
   - Select a video to promote
   - Creates promotion record (draft)

2. **Publish Promotion**:
   - Allocate budget from account balance
   - Set promotion duration/parameters
   - Video marked as `promoted: true`
   - `campaignMeta` added to video

3. **Promoted Video Distribution**:
   - Shown in main feed
   - Higher visibility/frequency
   - Separate stats tracking (`campaign_stats`)

4. **Statistics**:
   - Track views, likes, downloads separately
   - Show campaign performance
   - Calculate ROI for creator

5. **End Promotion**:
   - Budget exhausted or manual stop
   - Video returns to normal distribution
   - Campaign stats preserved

### Promotion Types (Potential)
Based on code structure, likely supports:
- **Time-based**: Run for X days
- **Budget-based**: Run until budget exhausted
- **View-based**: Run until X views

---

## PWA Configuration

### Service Worker (`app/worker/sw.js`)
- **Cache Name**: "app-shell-v1"
- **Precached Assets**: 
  - `/` (home page)
  - `/app/**` (app assets)
  - `/icons/**` (icons)
  - `/logo_circular.png`
  - `/org/**` (organization pages)

### PWA Setup (`next.config.ts`)
```typescript
const withPWAFunc = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  cacheStartUrl: true,
})
```

### Manifest (`app/manifest.ts`)
Defines app metadata for installation:
- App name
- Icons
- Theme colors
- Display mode
- Start URL

### Features
- **Installable**: Add to home screen
- **Offline Support**: Cached app shell works offline
- **Background Sync**: Can implement background tasks
- **Push Notifications**: Infrastructure ready (if implemented)

---

## Utility Libraries

### `lib/utils.ts`
**Key Functions**:
- `cn()`: Combine Tailwind classes with clsx and tailwind-merge
- `serializeTimestamp()`: Convert Firebase timestamp to ISO string
- `replaceWithCDN()`: Replace Firebase Storage URLs with CDN
- `recoverThumbnail()`: Get thumbnail URL with CDN replacement
- `formatTime()`: Human-readable time (e.g., "2 hours ago")
- `getLast()`: Get last element of array
- `flattenObject()`: Flatten nested objects

### `lib/logger.ts`
Logging utility for debugging:
- `logger.info()`, `logger.debug()`, `logger.error()`, `logger.warn()`
- Development mode: Console output
- Production mode: Can integrate with logging services

### `lib/dev.ts`
**`onlyProd()`**: Execute function only in production
```typescript
const data = await onlyProd(
  () => expensiveFunction(),
  defaultData // used in dev mode
)
```

### `lib/filter-blocked.ts`
**`filterBlocked()`**: Remove videos from blocked users

### `lib/randomize-videos.ts`
**`randomizeVideos()`**: Shuffle video array (for variety)

---

## Development Notes

### Code Organization Principles

1. **Services Layer**:
   - All database operations centralized in `/services`
   - Clear separation: `client/` vs `server/`
   - Single source of truth for data operations

2. **Server Actions as Bridge**:
   - Located in `/actions`
   - Handle cache + database operations
   - Provide clean API for client components
   - Enable easy transition to cloud functions

3. **Type Safety**:
   - Comprehensive TypeScript types in `/types`
   - No `any` types (minimize type assertions)
   - Interface-driven development

4. **Caching Philosophy**:
   - Redis for fast, distributed caching
   - Next.js cache as fallback
   - SWR for client-side data management
   - Optimistic updates for better UX

5. **Cloud Function Transition**:
   - Current: Actions call services directly
   - Future: Cloud functions handle operations
   - Actions will just trigger cloud functions
   - Database logic stays in services layer

### Performance Optimizations

1. **Virtual Scrolling**:
   - Only 7 videos in DOM at once
   - Tested with 800+ videos, no lag

2. **Prefetching**:
   - User profiles prefetched on scroll
   - Next batch of videos fetched at 75% scroll

3. **Image Optimization**:
   - Next.js Image component
   - Multiple quality levels: [5, 20, 25, 50, 75]
   - CDN-served images

4. **Code Splitting**:
   - Route-based code splitting (Next.js App Router)
   - Dynamic imports for heavy components

5. **Caching**:
   - Server-side caching (Redis + Next.js)
   - Client-side caching (SWR)
   - Stale-while-revalidate pattern

### Security Features

1. **Middleware Protection**:
   - Authentication checks on every request
   - Protected routes enforcement

2. **Security Headers** (next.config.ts):
   - Content Security Policy (CSP)
   - X-Frame-Options: DENY
   - X-Content-Type-Options: nosniff
   - Strict-Transport-Security (HSTS)
   - Permissions-Policy

3. **Firebase Rules** (not in codebase):
   - Firestore security rules
   - Storage security rules

### Known Issues & TODOs

From `TODO.md`:

1. **Comment Deletes** (TODO: 80186fb26301):
   - Currently soft deletes
   - Cloud function should handle cascade deletes

2. **Infinite Scroll Direction** (TODO: 253894320916):
   - Currently only scrolls forward
   - Partial resolution: Virtual scrolling handles large lists

3. **Interaction Checking** (TODO: 5d4b721bf00d):
   - Currently checks subcollections for user presence
   - Need better way to check likes, bookmarks

4. **Temporary Comment Replacement** (TODO: 55d45572bb3d):
   - TempId should be removed when updating DB
   - Cloud function will handle

5. **Shadow Operations** (NOTE: d6e453a10692):
   - Redis operations run alongside DB operations
   - Ensures sync before cloud functions take over
   - Remove DB operations when cloud functions live

---

## Environment Variables

Required environment variables (not in repo, use `.env.local`):

### Firebase Client SDK
```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

### Firebase Admin SDK
```
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
FIREBASE_DB_URL=
```

### Redis (Optional, Production)
```
REDIS_URL=
REDIS_PORT=
REDIS_USERNAME=
REDIS_PASSWORD=
```

### M-Pesa (Payment Integration)
```
MPESA_CONSUMER_KEY=
MPESA_CONSUMER_SECRET=
MPESA_SHORTCODE=
MPESA_PASSKEY=
MPESA_CALLBACK_URL=
```

---

## Build & Deployment

### Development
```bash
npm run dev
# or
pnpm dev
```
- Runs on http://localhost:3000
- Uses Turbopack for fast builds
- Hot module replacement
- Debug mode features enabled

### Production Build
```bash
npm run build
npm run start
```
- Optimized production bundle
- Static page generation where possible
- Server-side rendering for dynamic pages
- Service worker generation for PWA

### Linting
```bash
npm run lint
```
- ESLint checks
- Prettier formatting (via plugin)

---

## API Integration Summary

### Internal APIs
- `/api/account/*`: Account management
- `/api/ads/*`: Advertising system
- `/api/promotions/*`: Video promotions
- `/api/mpesa/*`: Payment callbacks
- `/api/proxy/*`: External service proxies

### External APIs
- **Firebase**: Authentication, Firestore, Storage
- **M-Pesa**: Mobile payments (Safaricom API)
- **Redis**: Caching (if configured)

### Data Flow
```
User Action
    ↓
Client Component
    ↓
Custom Hook (optional)
    ↓
Server Action
    ↓
Service Layer
    ↓
[Redis Cache] ← → [Firestore Database]
    ↓
Response back to Client
```

---

## Key Features Summary

### User Features
✅ Video feed with infinite scroll
✅ Like, comment, share, bookmark, download videos
✅ Follow/unfollow users
✅ User profiles
✅ Account wallet system
✅ Deposit via M-Pesa
✅ Referral program (earn from referrals)
✅ Content preferences/interests
✅ Watch history
✅ Block users

### Business Features
✅ Business profiles
✅ Ad creation and management
✅ Ad wallet (separate from account wallet)
✅ Ad performance analytics
✅ View-based pricing (1 KES per view)
✅ Ad frequency controls

### Creator Features
✅ Video upload
✅ Video promotion system
✅ Campaign analytics
✅ Monetization through promotions

### Technical Features
✅ Progressive Web App (PWA)
✅ Server-side rendering (SSR)
✅ Multi-tier caching (Redis + Next.js)
✅ Virtual scrolling for performance
✅ Real-time updates (Firebase)
✅ Responsive design (mobile + desktop)
✅ Dark/light theme
✅ Internationalization ready
✅ Security headers
✅ SEO optimization

---

## Conclusion

**Yohpal Web** is a modern, feature-rich video sharing platform built with Next.js 16 and Firebase. It combines social networking, content creation, advertising, and payment systems into a cohesive Progressive Web App.

The architecture follows best practices with clear separation of concerns:
- **Types**: Comprehensive TypeScript definitions
- **Services**: Centralized database operations
- **Actions**: Server-side mutation handlers
- **Hooks**: Reusable client-side logic
- **Components**: Modular UI building blocks
- **Caching**: Multi-tier performance optimization

The application is production-ready with security measures, performance optimizations, and scalability considerations. The codebase is well-organized for maintainability and future enhancements.

---

**Document Version**: 1.0  
**Last Updated**: February 12, 2026  
**Generated for**: Yohpal Web Application Analysis
