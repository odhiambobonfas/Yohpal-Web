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

    // Fetch user balance data from Firestore
    const userDoc = await db.collection("users").doc(userId).get()
    if (!userDoc.exists) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "User not found" },
        { status: 404 }
      )
    }

    const userData = userDoc.data()

    // Fetch transaction totals
    const depositsSnapshot = await db
      .collection("transactions")
      .where("userId", "==", userId)
      .where("type", "==", "deposit")
      .where("status", "==", "completed")
      .get()

    const withdrawalsSnapshot = await db
      .collection("transactions")
      .where("userId", "==", userId)
      .where("type", "==", "withdrawal")
      .where("status", "==", "completed")
      .get()

    const referralEarningsSnapshot = await db
      .collection("transactions")
      .where("userId", "==", userId)
      .where("type", "==", "referral")
      .where("status", "==", "completed")
      .get()

    const bonusEarningsSnapshot = await db
      .collection("transactions")
      .where("userId", "==", userId)
      .where("type", "==", "bonus")
      .where("status", "==", "completed")
      .get()

    // Calculate totals
    let totalDeposits = 0
    depositsSnapshot.forEach((doc) => {
      totalDeposits += doc.data().amount || 0
    })

    let totalWithdrawals = 0
    withdrawalsSnapshot.forEach((doc) => {
      totalWithdrawals += doc.data().amount || 0
    })

    let referralEarnings = 0
    referralEarningsSnapshot.forEach((doc) => {
      referralEarnings += doc.data().amount || 0
    })

    let bonusEarnings = 0
    bonusEarningsSnapshot.forEach((doc) => {
      bonusEarnings += doc.data().amount || 0
    })

    const totalEarnings = referralEarnings + bonusEarnings
    const availableBalance = totalDeposits + totalEarnings - totalWithdrawals

    // Count network size (referrals)
    const referralsSnapshot = await db
      .collection("users")
      .where("refererCode", "==", userData?.referralCode || "")
      .count()
      .get()

    const networkSize = referralsSnapshot.data().count || 0

    const balance: AccountBalance = {
      totalDeposits,
      totalEarnings,
      availableBalance: Math.max(0, availableBalance),
      pendingBalance: userData?.pendingBalance || 0,
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
