import { useState } from "react"

import { AuthUser } from "#/users"
import {
    loginWithEmailAndPassword,
    signUpWithEmailAndPassword,
    logout,
} from "@/services/client/auth"
import { getError } from "@/lib/utils"
import { createSession, destroySession } from "@/actions/session"
import { createCookie } from "@/actions/cookies"
import { COOKIES } from "@/constants"

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

    return { login, signUp, logOut, loading, error }
}
