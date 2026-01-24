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

        // Use unified balance from user document
        let balance = userData?.availableBalance || 0
        let totalDeposited = userData?.totalDeposits || 0

        // Fallback: if no balance stored, calculate from mpesa_transactions
        if (balance === 0 && totalDeposited === 0) {
            const depositsSnapshot = await db
                .collection("mpesa_transactions")
                .where("userId", "==", userId)
                .where("status", "==", "completed")
                .get()

            depositsSnapshot.forEach((doc) => {
                totalDeposited += doc.data().amount || 0
            })

            // Calculate balance from deposits minus what's been spent on ads
            const publishSnapshot = await db
                .collection("adTransactions")
                .where("userId", "==", userId)
                .get()

            let totalAllocated = 0
            publishSnapshot.forEach((doc) => {
                const data = doc.data()
                // ad_publish and ad_republish have negative amounts
                if (data.type === "ad_publish" || data.type === "ad_republish") {
                    totalAllocated += Math.abs(data.amount || 0)
                }
            })

            balance = Math.max(0, totalDeposited - totalAllocated)
        }

        // Calculate total spent from ad transactions (views charged)
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
