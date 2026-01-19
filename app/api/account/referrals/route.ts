import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { COOKIES } from "@/constants"
import { db } from "@/lib/firebase/firebase.admin"
import {
  Referral,
  ReferralFilters,
  ReferralsResponse,
  NetworkStats,
  ApiResponse,
} from "@/types/account"

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get(COOKIES.User)?.value

    if (!userId) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Parse query params
    const { searchParams } = new URL(request.url)
    const filters: ReferralFilters = {
      level: (searchParams.get("level") as ReferralFilters["level"]) || "all",
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "20"),
    }

    // Get user's referral code
    const userDoc = await db.collection("users").doc(userId).get()
    if (!userDoc.exists) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "User not found" },
        { status: 404 }
      )
    }

    const userData = userDoc.data()
    const referralCode = userData?.referralCode || ""

    // Get primary referrals (users who used this user's referral code)
    const primaryReferralsSnapshot = await db
      .collection("users")
      .where("refererCode", "==", referralCode)
      .get()

    const primaryReferrals: Referral[] = []
    const primaryReferralCodes: string[] = []

    primaryReferralsSnapshot.forEach((doc) => {
      const data = doc.data()
      primaryReferralCodes.push(data.referralCode || "")
      primaryReferrals.push({
        id: doc.id,
        userId: doc.id,
        userName: data.userName || "",
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        profilePicture: data.profile_picture || "",
        level: "primary",
        joinedAt: data.createdAt || "",
        totalEarned: 0, // Will be calculated from transactions
        isActive: true,
      })
    })

    // Get secondary referrals (users referred by primary referrals)
    const secondaryReferrals: Referral[] = []
    if (primaryReferralCodes.length > 0) {
      // Query in batches of 10 (Firestore 'in' query limit)
      const batches = []
      for (let i = 0; i < primaryReferralCodes.length; i += 10) {
        const batchCodes = primaryReferralCodes.slice(i, i + 10).filter((c) => c)
        if (batchCodes.length > 0) {
          batches.push(
            db.collection("users").where("refererCode", "in", batchCodes).get()
          )
        }
      }

      const batchResults = await Promise.all(batches)
      batchResults.forEach((snapshot) => {
        snapshot.forEach((doc) => {
          const data = doc.data()
          secondaryReferrals.push({
            id: doc.id,
            userId: doc.id,
            userName: data.userName || "",
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            profilePicture: data.profile_picture || "",
            level: "secondary",
            joinedAt: data.createdAt || "",
            totalEarned: 0,
            isActive: true,
          })
        })
      })
    }

    // Get referral earnings
    const earningsSnapshot = await db
      .collection("transactions")
      .where("userId", "==", userId)
      .where("type", "==", "referral")
      .where("status", "==", "completed")
      .get()

    let totalNetworkEarnings = 0
    earningsSnapshot.forEach((doc) => {
      totalNetworkEarnings += doc.data().amount || 0
    })

    // Combine and filter referrals
    let allReferrals = [...primaryReferrals, ...secondaryReferrals]

    if (filters.level && filters.level !== "all") {
      allReferrals = allReferrals.filter((r) => r.level === filters.level)
    }

    // Sort by join date (most recent first)
    allReferrals.sort((a, b) => {
      const dateA =
        typeof a.joinedAt === "string"
          ? new Date(a.joinedAt).getTime()
          : a.joinedAt?.seconds * 1000 || 0
      const dateB =
        typeof b.joinedAt === "string"
          ? new Date(b.joinedAt).getTime()
          : b.joinedAt?.seconds * 1000 || 0
      return dateB - dateA
    })

    // Pagination
    const page = filters.page || 1
    const limit = filters.limit || 20
    const start = (page - 1) * limit
    const paginatedReferrals = allReferrals.slice(start, start + limit)

    const stats: NetworkStats = {
      primaryReferrals: primaryReferrals.length,
      secondaryReferrals: secondaryReferrals.length,
      totalNetworkSize: primaryReferrals.length + secondaryReferrals.length,
      totalNetworkEarnings,
      referralCode,
      referralLink: `https://yohpal.com/auth/register?ref=${referralCode}`,
    }

    return NextResponse.json<ApiResponse<ReferralsResponse>>({
      success: true,
      data: {
        referrals: paginatedReferrals,
        stats,
        total: allReferrals.length,
        page,
        totalPages: Math.ceil(allReferrals.length / limit),
        hasMore: start + limit < allReferrals.length,
      },
    })
  } catch (error) {
    console.error("Error fetching referrals:", error)
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Failed to fetch referrals" },
      { status: 500 }
    )
  }
}
