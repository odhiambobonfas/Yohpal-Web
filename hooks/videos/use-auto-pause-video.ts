import { logger } from "@/lib/logger"
import { getError } from "@/lib/utils"
import { useEffect, useRef } from "react"

type Options = {
    id?: string
    isActive?: boolean
    unloadOnPause?: boolean
    updatePlayState: (state: boolean) => void
}

export function useAutoPauseVideo(
    videoRef: React.RefObject<HTMLVideoElement | null>,
    { id, isActive = false, unloadOnPause = false, updatePlayState }: Options,
) {
    const wasPlayingRef = useRef(false)
    const savedSrcRef = useRef<string | null>(null)

    useEffect(() => {
        const pauseSelf = () => {
            const v = videoRef.current
            if (!v) return
            wasPlayingRef.current = !v.paused && !v.ended
            if (!v.paused) {
                v.pause()
                updatePlayState(false)
            }
            try {
                if ("mediaSession" in navigator) {
                    navigator.mediaSession.playbackState = "none"
                }
            } catch (e) {
                logger.error(`[PAUSE ERR]: ${getError(e)}`)
            }
            if (unloadOnPause && v.src) {
                savedSrcRef.current = v.src
                v.removeAttribute("src")
                v.load()
            }
        }

        const playSelfIfActive = async () => {
            const v = videoRef.current
            if (!v) return
            if (!isActive) return

            window.dispatchEvent(
                new CustomEvent("yohpal:pause-all", { detail: { exceptId: id ?? null } }),
            )

            if (unloadOnPause && !v.src && savedSrcRef.current) {
                v.src = savedSrcRef.current
                v.load()
            }

            try {
                await v.play()
                updatePlayState(true)
            } catch (e) {
                updatePlayState(false)
                logger.error(`[PLAY ERR]: ${getError(e)}`)
            }
        }

        const onVisibilityChange = () => {
            if (document.hidden) {
                pauseSelf()
                window.dispatchEvent(
                    new CustomEvent("yohpal:pause-all", { detail: { exceptId: null } }),
                )
            } else {
                playSelfIfActive()
            }
        }

        const onBlur = () => {
            pauseSelf()
            window.dispatchEvent(
                new CustomEvent("yohpal:pause-all", { detail: { exceptId: null } }),
            )
        }

        const onPageHide = () => {
            pauseSelf()
            window.dispatchEvent(
                new CustomEvent("yohpal:pause-all", { detail: { exceptId: null } }),
            )
        }

        const onPageshow = () => {
            playSelfIfActive()
        }

        const onPauseAllEvent = (e: Event) => {
            const custom = e as CustomEvent<{ exceptId: string | null }>
            const exceptId = custom.detail?.exceptId ?? null
            if (exceptId && exceptId === id) return

            const v = videoRef.current
            if (!v) return
            if (!v.paused) {
                v.pause()
                updatePlayState(false)
            }
        }

        document.addEventListener("visibilitychange", onVisibilityChange)
        window.addEventListener("blur", onBlur)
        window.addEventListener("pagehide", onPageHide)
        window.addEventListener("pageshow", onPageshow)
        window.addEventListener("yohpal:pause-all", onPauseAllEvent as EventListener)

        return () => {
            document.removeEventListener("visibilitychange", onVisibilityChange)
            window.removeEventListener("blur", onBlur)
            window.removeEventListener("pagehide", onPageHide)
            window.removeEventListener("pageshow", onPageshow)
            window.removeEventListener("yohpal:pause-all", onPauseAllEvent as EventListener)
        }
    }, [videoRef, id, isActive, unloadOnPause, updatePlayState])
}
