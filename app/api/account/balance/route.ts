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

    // Fetch completed deposits from mpesa_transactions
    const depositsSnapshot = await db
      .collection("mpesa_transactions")
      .where("userId", "==", userId)
      .where("status", "==", "completed")
      .get()

    // Calculate total deposits
    let totalDeposits = 0
    depositsSnapshot.forEach((doc) => {
      totalDeposits += doc.data().amount || 0
    })

    const referralEarnings = userData?.referralEarnings || 0
    const bonusEarnings = userData?.bonusEarnings || 0
    const totalEarnings = referralEarnings + bonusEarnings
    const availableBalance = totalDeposits + totalEarnings

    // Count network size (referrals)
    const referralsSnapshot = await db
      .collection("users")
      .where("refererCode", "==", userData?.referralCode || "")
      .count()
      .get()

    const networkSize = referralsSnapshot.data().count || 0

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
      networkSize,
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
