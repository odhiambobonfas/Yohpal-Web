import { useState } from "react"
import { AuthUser } from "#/users"
import {
    loginWithEmailAndPassword,
    signUpWithEmailAndPassword,
    logout,
} from "@/services/client/auth"

export function useEmailAuth() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const login = async (user: AuthUser) => {
        setLoading(true)
        setError(null)
        try {
            const result = await loginWithEmailAndPassword(user)
            return { success: true, data: result, error: null }
        } catch (e) {
            // @ts-expect-error  message does exist on error
            const errorMsg = e.message || "Login failed"
            setError(errorMsg)
            return { success: false, data: null, error: errorMsg }
        } finally {
            setLoading(false)
        }
    }

    const signUp = async (user: AuthUser) => {
        setLoading(true)
        setError(null)
        try {
            const result = await signUpWithEmailAndPassword(user)
            return { success: true, data: result, error: null }
        } catch (e) {
            // @ts-expect-error  message does exist on error
            const errorMsg = e.message || "Sign up failed"
            setError(errorMsg)
            return { success: false, data: null, error: errorMsg }
        } finally {
            setLoading(false)
        }
    }
    const logOut = async () => {
        setLoading(true)
        setError(null)
        try {
            const result = await logout()
            return { success: true, data: result, error: null }
        } catch (e) {
            // @ts-expect-error  message does exist on error
            const errorMsg = e.message || "Log Out failed"
            setError(errorMsg)
            return { success: false, data: null, error: errorMsg }
        } finally {
            setLoading(false)
        }
    }

    return { login, signUp, logOut, loading, error }
}
