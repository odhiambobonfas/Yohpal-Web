import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { COOKIES } from "@/constants"
import { db } from "@/lib/firebase/firebase.admin"
import { ApiResponse } from "@/types/account"
import { AdWalletBalance } from "@/types/ads"

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

        // Get user's business profile
        const userDoc = await db.collection("users").doc(userId).get()
        if (!userDoc.exists) {
            return NextResponse.json<ApiResponse<null>>(
                { success: false, error: "User not found" },
                { status: 404 }
            )
        }

        const userData = userDoc.data()
        const businessProfile = userData?.businessProfile

        if (!businessProfile) {
            return NextResponse.json<ApiResponse<AdWalletBalance>>({
                success: true,
                data: {
                    balance: 0,
                    totalDeposited: 0,
                    totalSpent: 0,
                },
            })
        }

        // Calculate total deposited from transactions
        const depositsSnapshot = await db
            .collection("adTransactions")
            .where("userId", "==", userId)
            .where("type", "==", "deposit")
            .get()

        let totalDeposited = 0
        depositsSnapshot.forEach((doc) => {
            const data = doc.data()
            const amount = data.amount || 0
            // Only count successful deposits (or legacy transactions without status)
            const status = data.status
            if (amount > 0 && (status === "success" || status === "completed" || !status)) {
                totalDeposited += amount
            }
        })

        // Calculate total spent from transactions
        const spendSnapshot = await db
            .collection("adTransactions")
            .where("userId", "==", userId)
            .where("type", "==", "ad_spend")
            .get()

        let totalSpent = 0
        spendSnapshot.forEach((doc) => {
            const data = doc.data()
            const amount = data.amount || 0
            // Ad spend is usually negative, but we want the absolute value
            if (amount < 0) {
                totalSpent += Math.abs(amount)
            }
        })

        // Calculate available balance dynamically
        // Balance = Total Deposited - Total Spent
        // This fixes the issue where the user profile walletBalance might be out of sync
        const balance = Math.max(0, totalDeposited - totalSpent)

        return NextResponse.json<ApiResponse<AdWalletBalance>>({
            success: true,
            data: {
                balance,
                totalDeposited,
                totalSpent,
            },
        })
    } catch (error) {
        console.error("Error fetching wallet balance:", error)
        return NextResponse.json<ApiResponse<null>>(
            { success: false, error: "Failed to fetch wallet balance" },
            { status: 500 }
        )
    }
}
