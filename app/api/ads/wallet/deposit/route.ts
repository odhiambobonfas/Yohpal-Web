import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { COOKIES, AD_MIN_DEPOSIT } from "@/constants"
import { db, serverTimestamp } from "@/lib/firebase/firebase.admin"
import { ApiResponse } from "@/types/account"
import { AdDepositRequest, AdDepositResponse } from "@/types/ads"

const DEPOSIT_API_URL = process.env.YOHPAL_ACCOUNT_API_URL || "https://yohpal-apis.onrender.com"

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies()
        const userId = cookieStore.get(COOKIES.User)?.value

        if (!userId) {
            return NextResponse.json<ApiResponse<null>>(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            )
        }

        const body: AdDepositRequest = await request.json()
        const { phoneNumber, amount } = body

        // Validate input
        if (!phoneNumber || !amount) {
            return NextResponse.json<ApiResponse<null>>(
                { success: false, error: "Phone number and amount are required" },
                { status: 400 }
            )
        }

        if (amount < AD_MIN_DEPOSIT) {
            return NextResponse.json<ApiResponse<null>>(
                { success: false, error: `Minimum deposit amount is KES ${AD_MIN_DEPOSIT}` },
                { status: 400 }
            )
        }

        // Check user has business profile
        const userDoc = await db.collection("users").doc(userId).get()
        if (!userDoc.exists) {
            return NextResponse.json<ApiResponse<null>>(
                { success: false, error: "User not found" },
                { status: 404 }
            )
        }

        const userData = userDoc.data()
        if (!userData?.businessProfile) {
            return NextResponse.json<ApiResponse<null>>(
                { success: false, error: "Business profile required" },
                { status: 403 }
            )
        }

        // Format phone number (ensure it starts with 254)
        let formattedPhone = phoneNumber.replace(/\s/g, "")
        if (formattedPhone.startsWith("0")) {
            formattedPhone = "254" + formattedPhone.slice(1)
        } else if (formattedPhone.startsWith("+254")) {
            formattedPhone = formattedPhone.slice(1)
        } else if (!formattedPhone.startsWith("254")) {
            formattedPhone = "254" + formattedPhone
        }

        // Call the backend M-Pesa STK push API for ad wallet deposits
        const response = await fetch(`${DEPOSIT_API_URL}/ad-deposit/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                userId,
                phoneNumber: formattedPhone,
                amount: Math.round(amount),
                type: "ad_wallet", // Indicate this is for ad wallet
            }),
        })

        const data = await response.json()

        if (!response.ok) {
            // If the ad-specific endpoint doesn't exist, try the regular deposit endpoint
            // In production, you'd want to create a specific endpoint for ad deposits
            const fallbackResponse = await fetch(`${DEPOSIT_API_URL}/deposit/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId,
                    phoneNumber: formattedPhone,
                    amount: Math.round(amount),
                }),
            })

            const fallbackData = await fallbackResponse.json()

            if (!fallbackResponse.ok) {
                return NextResponse.json<ApiResponse<null>>(
                    { success: false, error: fallbackData.message || "Deposit request failed" },
                    { status: fallbackResponse.status }
                )
            }

            // Create a pending ad transaction record
            // The actual deposit will be handled by the webhook callback
            await db.collection("adTransactions").add({
                userId,
                type: "deposit",
                amount: Math.round(amount),
                description: "Ad wallet deposit (pending)",
                status: "pending",
                checkoutRequestId: fallbackData.checkoutRequestId,
                createdAt: serverTimestamp(),
            })

            return NextResponse.json<ApiResponse<AdDepositResponse>>({
                success: true,
                data: {
                    success: true,
                    message: "STK push sent. Please check your phone and enter your M-Pesa PIN.",
                    transactionId: fallbackData.transactionId,
                    checkoutRequestId: fallbackData.checkoutRequestId,
                },
            })
        }

        // Create a pending ad transaction record
        await db.collection("adTransactions").add({
            userId,
            type: "deposit",
            amount: Math.round(amount),
            description: "Ad wallet deposit (pending)",
            status: "pending",
            checkoutRequestId: data.checkoutRequestId,
            createdAt: serverTimestamp(),
        })

        return NextResponse.json<ApiResponse<AdDepositResponse>>({
            success: true,
            data: {
                success: true,
                message: "STK push sent. Please check your phone and enter your M-Pesa PIN.",
                transactionId: data.transactionId,
                checkoutRequestId: data.checkoutRequestId,
            },
        })
    } catch (error) {
        console.error("Error processing ad deposit:", error)
        return NextResponse.json<ApiResponse<null>>(
            { success: false, error: "Failed to process deposit request" },
            { status: 500 }
        )
    }
}
