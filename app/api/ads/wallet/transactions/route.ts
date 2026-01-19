import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { COOKIES } from "@/constants"
import { db } from "@/lib/firebase/firebase.admin"
import { ApiResponse } from "@/types/account"
import { AdTransaction, AdTransactionsResponse } from "@/types/ads"

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

        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get("page") || "1")
        const limit = parseInt(searchParams.get("limit") || "10")
        const type = searchParams.get("type") as "deposit" | "ad_spend" | null

        let query = db
            .collection("adTransactions")
            .where("userId", "==", userId)
            .orderBy("createdAt", "desc")

        if (type) {
            query = query.where("type", "==", type)
        }

        // Get total count
        const countSnapshot = await query.count().get()
        const total = countSnapshot.data().count

        // Get paginated results
        const offset = (page - 1) * limit
        const txSnapshot = await query.offset(offset).limit(limit).get()

        const transactions: AdTransaction[] = txSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as AdTransaction[]

        const totalPages = Math.ceil(total / limit)

        return NextResponse.json<ApiResponse<AdTransactionsResponse>>({
            success: true,
            data: {
                transactions,
                total,
                page,
                totalPages,
                hasMore: page < totalPages,
            },
        })
    } catch (error) {
        console.error("Error fetching ad transactions:", error)
        return NextResponse.json<ApiResponse<null>>(
            { success: false, error: "Failed to fetch transactions" },
            { status: 500 }
        )
    }
}
