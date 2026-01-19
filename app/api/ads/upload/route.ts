import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { COOKIES } from "@/constants"
import { ApiResponse } from "@/types/account"

// This route is a placeholder - actual uploads happen client-side to Firebase Storage
// This could be used for server-side upload validation or alternative upload methods

export async function POST() {
    try {
        const cookieStore = await cookies()
        const userId = cookieStore.get(COOKIES.User)?.value

        if (!userId) {
            return NextResponse.json<ApiResponse<null>>(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            )
        }

        // For now, return a message indicating client-side upload should be used
        return NextResponse.json<ApiResponse<{ message: string }>>({
            success: true,
            data: {
                message: "Use client-side upload to Firebase Storage",
            },
        })
    } catch (error) {
        console.error("Error in upload route:", error)
        return NextResponse.json<ApiResponse<null>>(
            { success: false, error: "Upload failed" },
            { status: 500 }
        )
    }
}
