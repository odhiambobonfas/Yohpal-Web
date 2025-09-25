import { useEffect, useRef } from "react"

type Options = {
    id?: string
    isActive?: boolean
    unloadOnPause?: boolean
}

export function useAutoPauseVideo(
    videoRef: React.RefObject<HTMLVideoElement | null>,
    { id, isActive = false, unloadOnPause = false }: Options = {},
) {
    const wasPlayingRef = useRef(false)
    const savedSrcRef = useRef<string | null>(null)

    useEffect(() => {
        const pauseSelf = () => {
            const v = videoRef.current
            if (!v) return

            wasPlayingRef.current = !v.paused && !v.ended

            if (!v.paused) v.pause()

            try {
                if ("mediaSession" in navigator) {
                    navigator.mediaSession.playbackState = "none"
                }
            } catch (e) {}

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
            } catch (err) {}
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
            if (!v.paused) v.pause()
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
    }, [videoRef, id, isActive, unloadOnPause])
}
