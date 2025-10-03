import { useState } from "react"

import { AuthUser } from "#/users"
import { createCookie } from "@/actions/cookies"
import { createSession, destroySession } from "@/actions/session"
import { COOKIES } from "@/constants"
import { getError } from "@/lib/utils"
import {
    loginWithEmailAndPassword,
    logout,
    signUpWithEmailAndPassword,
    verifyEmailAction,
} from "@/services/client/auth"

function getUserFriendlyError(error: string, context: "login" | "signup" | "verify"): string {
    const errorMsg = error.toLowerCase() || ""

    if (context === "login") {
        if (
            errorMsg.includes("invalid-credential") ||
            errorMsg.includes("wrong-password") ||
            errorMsg.includes("user-not-found")
        ) {
            return "Invalid email or password"
        }
        if (errorMsg.includes("too-many-requests")) {
            return "Too many failed attempts. Please try again later"
        }
        return "Failed to login. Please try again"
    }

    if (context === "signup") {
        if (errorMsg.includes("invalid-email")) {
            return "Please enter a valid email address"
        }
        if (errorMsg.includes("weak-password")) {
            return "Password is too weak. Please use at least 6 characters"
        }
        // Don't reveal if email exists - security risk
        return "Failed to create account. Please try again"
    }

    if (context === "verify") {
        if (errorMsg.includes("too-many-requests")) {
            return "Too many verification emails sent. Please wait before trying again"
        }
        return "Failed to send verification email. Please try again"
    }

    return "Something went wrong. Please try again"
}
export function useEmailAuth() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const login = async (user: AuthUser) => {
        setLoading(true)
        setError(null)

        try {
            const userCreds = await loginWithEmailAndPassword(user)
            await createSession({ token: await userCreds.getIdToken(), uid: userCreds.uid })

            if (!userCreds.emailVerified) {
                await createCookie({ name: COOKIES.EmailNotVerified, value: "false" })
            }

            return { success: true }
        } catch (e) {
            const errorMsg = getError(e)
            // can be hooked up to log services or sth
            console.error(`[LOGIN ERR]: ${errorMsg}`)
            setError(getUserFriendlyError(errorMsg, "login"))
            return { success: false }
        } finally {
            setLoading(false)
        }
    }

    const signUp = async (user: AuthUser) => {
        setLoading(true)
        setError(null)
        try {
            const userCreds = await signUpWithEmailAndPassword(user)
            await createSession({ token: await userCreds.getIdToken(), uid: userCreds.uid })
            return { success: true }
        } catch (e) {
            const errorMsg = getError(e)
            console.error(`[SIGN UP ERR]: ${errorMsg}`)
            setError(getUserFriendlyError(errorMsg, "signup"))
            return { success: false }
        } finally {
            setLoading(false)
        }
    }

    const logOut = async () => {
        setLoading(true)
        setError(null)
        try {
            await logout()
            await destroySession()

            return { success: true }
        } catch (e) {
            const errorMsg = getError(e)
            console.error(`[LOG OUT ERR]: ${errorMsg}`)
            setError("Failed to logout")
            return { success: false }
        } finally {
            setLoading(false)
        }
    }

    const verifyEmail = async () => {
        setLoading(true)
        setError(null)
        try {
            await verifyEmailAction()
        } catch (e) {
            const errorMsg = getError(e)
            console.error(`[VERIFY EMAIL ERR]: ${errorMsg}`)
            setError(getUserFriendlyError(errorMsg, "verify"))
        } finally {
            setLoading(false)
        }
    }

    return { login, signUp, logOut, verifyEmail, loading, error }
}
