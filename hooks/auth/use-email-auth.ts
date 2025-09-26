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

export function useEmailAuth() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const login = async (user: AuthUser) => {
        setLoading(true)
        setError(null)

        try {
            const userCreds = await loginWithEmailAndPassword(user)
            await createSession(await userCreds.getIdToken())

            if (!userCreds.emailVerified) {
                await createCookie({ name: COOKIES.EmailNotVerified, value: "false" })
            }

            return { success: true }
        } catch (e) {
            const errorMsg = getError(e) || "Login failed"
            setError(errorMsg)
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
            await createSession(await userCreds.getIdToken())
            return { success: true }
        } catch (e) {
            const errorMsg = getError(e) || "Sign up failed"
            setError(errorMsg)
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
            const errorMsg = getError(e) || "Log Out failed"
            setError(errorMsg)
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
            const errMsg = getError(e) || "Failed to send verification link"
            setError(errMsg)
        } finally {
            setLoading(false)
        }
    }

    return { login, signUp, logOut, verifyEmail, loading, error }
}
