import { useState } from "react"

export function useUser() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const isLoggedIn = async () => {}
    const profile = async (userId: string) => {
        try {
            setLoading(true)
            setError(null)
        } catch (e) {
        } finally {
            setLoading(false)
        }
    }

    return { loading, error, profile }
}
