import { getError } from "@/lib/utils"
import { useAuth } from "@/providers/Auth"
import { reportVideo } from "@/services/client/video-report-mutation"
import { useState } from "react"

export function useReportVideoMutation() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const { profile } = useAuth()

    const submitReport = async (videoId: string, scenario: string, details: string) => {
        try {
            setLoading(true)
            setError(null)

            await reportVideo({
                userId: profile!.uid,
                videoId,
                reason: scenario,
                context: details,
                userName: profile!.userName,
            })
        } catch (e) {
            const errorMsg = getError(e)
            setError(errorMsg)
        } finally {
            setLoading(false)
        }
    }

    return { submitReport, loading, error }
}
