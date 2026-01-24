import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { COOKIES } from "@/constants"
import { db } from "@/lib/firebase/firebase.admin"
import { AccountBalance, ApiResponse } from "@/types/account"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get(COOKIES.User)?.value

    if (!userId) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Fetch user data from Firestore
    const userDoc = await db.collection("users").doc(userId).get()
    if (!userDoc.exists) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "User not found" },
        { status: 404 }
      )
    }

    const userData = userDoc.data()

    // Use stored balance fields if available, otherwise calculate dynamically
    let totalDeposits = userData?.totalDeposits || 0
    let availableBalance = userData?.availableBalance || 0

    // Fallback: calculate from transactions if stored values are 0 (for existing users)
    if (totalDeposits === 0) {
      const depositsSnapshot = await db
        .collection("mpesa_transactions")
        .where("userId", "==", userId)
        .where("status", "==", "completed")
        .get()

      depositsSnapshot.forEach((doc) => {
        totalDeposits += doc.data().amount || 0
      })
    }

    const referralEarnings = userData?.referralEarnings || 0
    const bonusEarnings = userData?.bonusEarnings || 0
    const totalEarnings = referralEarnings + bonusEarnings

    // If availableBalance not stored, calculate it
    if (availableBalance === 0 && (totalDeposits > 0 || totalEarnings > 0)) {
      availableBalance = totalDeposits + totalEarnings
    }

    // Calculate total spent on ads from adTransactions
    const adSpendSnapshot = await db
      .collection("adTransactions")
      .where("userId", "==", userId)
      .where("type", "==", "ad_spend")
      .get()

    let totalSpentOnAds = 0
    adSpendSnapshot.forEach((doc) => {
      const amount = doc.data().amount || 0
      // Ad spend amounts are negative, so we take absolute value
      if (amount < 0) {
        totalSpentOnAds += Math.abs(amount)
      }
    })

    // Count pending deposits
    const pendingSnapshot = await db
      .collection("mpesa_transactions")
      .where("userId", "==", userId)
      .where("status", "==", "pending")
      .get()

    let pendingBalance = 0
    pendingSnapshot.forEach((doc) => {
      pendingBalance += doc.data().amount || 0
    })

    const balance: AccountBalance = {
      totalDeposits,
      totalEarnings,
      availableBalance: Math.max(0, availableBalance),
      pendingBalance,
      totalSpentOnAds,
      referralEarnings,
      bonusEarnings,
    }

    return NextResponse.json<ApiResponse<AccountBalance>>({
      success: true,
      data: balance,
    })
  } catch (error) {
    console.error("Error fetching balance:", error)
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Failed to fetch balance" },
      { status: 500 }
    )
  }
}
