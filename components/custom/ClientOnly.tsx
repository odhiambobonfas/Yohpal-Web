"use client"
import { useEffect, useState } from "react"

// Poor mans nuxt homage
// https://nuxt.com/docs/4.x/api/components/client-only
export default function ClientOnly({ children }: { children: React.ReactNode }) {
    const [clientLoaded, setClientLoaded] = useState(false)

    useEffect(() => {
        setClientLoaded(true)
    }, [])
    if (!clientLoaded) return null
    return <>{children}</>
}
