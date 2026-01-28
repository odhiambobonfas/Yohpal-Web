"use client"
import { User as FirebaseUser, onAuthStateChanged } from "firebase/auth"
import { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from "react"

import { YPUser } from "#/users"
import { useUser } from "@/hooks/user/use-user"
import { auth } from "@/lib/firebase/firebase.browser"

type AuthContextType = {
    user: FirebaseUser | null
    profile: YPUser | null
    loading: boolean
    isAuthenticated: boolean
    refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function YPAuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<FirebaseUser | null>(null)
    const [userProfile, setUserProfile] = useState<YPUser | null>(null)
    const [loading, setLoading] = useState(true)
    const { getProfile } = useUser()
    const stableGetProfile = useCallback(getProfile, [getProfile])

    const refreshProfile = useCallback(async () => {
        if (user) {
            const ypUser = await stableGetProfile(user.uid)
            setUserProfile(ypUser)
        }
    }, [user, stableGetProfile])

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setUser(user)
            if (user) {
                const ypUser = await stableGetProfile(user.uid)
                setUserProfile(ypUser)
            } else {
                setUserProfile(null)
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
                refreshProfile,
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
