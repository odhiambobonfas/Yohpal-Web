"use client"
import { useEffect } from "react"

interface Props {
    nextVideo: () => void
    prevVideo: () => void
}

export default function KeyShortcuts({ nextVideo, prevVideo }: Props) {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // ignore if user is typing in an input/textarea
            if (
                e.target instanceof HTMLInputElement ||
                e.target instanceof HTMLTextAreaElement ||
                (e.target as HTMLElement).isContentEditable
            ) {
                return
            }

            switch (e.key) {
                case "ArrowDown":
                case "j":
                    e.preventDefault()
                    nextVideo()
                    break
                case "ArrowUp":
                case "k":
                    e.preventDefault()
                    prevVideo()
                    break
            }
        }

        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [nextVideo, prevVideo])

    return null
}
