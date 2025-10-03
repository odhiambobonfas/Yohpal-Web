import { getError } from "@/lib/utils"
import { getCompanyGeneralSettings } from "@/services/client/org/settings"
import { useState } from "react"

export default function useCompanySettings() {
    const [error, setError] = useState<string | null>(null)
    const getSettings = async () => {
        try {
            setError(null)
            return await getCompanyGeneralSettings()
        } catch (e) {
            const errorMsg = getError(e) || "Failed to load settings"
            setError(errorMsg)
        }
    }
    return { getSettings, error }
}
