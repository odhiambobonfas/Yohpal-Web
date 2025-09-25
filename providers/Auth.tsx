"use client"
import { useState, createContext, type ReactNode, useEffect, useContext, useCallback } from "react"
import { User as FirebaseUser } from "firebase/auth"
import { onAuthStateChanged } from "firebase/auth"

import { auth } from "@/lib/firebase/firebase.browser"
import { YPUser } from "#/users"
import { useUser } from "@/hooks/user/use-user"

type AuthContextType = {
    user: FirebaseUser | null
    profile: YPUser | null
    loading: boolean
    isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function YPAuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<FirebaseUser | null>(null)
    const [userProfile, setUserProfile] = useState<YPUser | null>(null)
    const [loading, setLoading] = useState(true)
    const { getProfile } = useUser()
    const stableGetProfile = useCallback(getProfile, [getProfile])

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setUser(user)
            if (user) {
                const ypUser = await stableGetProfile(user.uid)
                setUserProfile(ypUser)
            }
            setLoading(false)
        })

        return () => unsubscribe()
    }, [stableGetProfile])

    return (
        <AuthContext.Provider
            value={{
                user,
                profile: userProfile,
                loading: loading,
                isAuthenticated: !!user,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) throw new Error("useAuth must be used within AuthProvider")
    return context
}
