"use client"
import { DEBUG_BUILD } from "@/constants"
import React, { useCallback, useRef, useState } from "react"
import ClientOnly from "./ClientOnly"

export default function DebugWindow({ children }: { children: React.ReactNode }) {
    const [isDragging, setIsDragging] = useState(false)
    const [position, setPosition] = useState({ x: 100, y: 16 }) // top-4 right-4 equivalent
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
    const windowRef = useRef<HTMLDivElement>(null)

    const handleMouseDown = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault()
            setIsDragging(true)
            setDragStart({
                x: e.clientX - position.x,
                y: e.clientY - position.y,
            })
        },
        [position],
    )

    const handleMouseMove = useCallback(
        (e: MouseEvent) => {
            if (!isDragging) return

            const newX = e.clientX - dragStart.x
            const newY = e.clientY - dragStart.y

            // Keep within viewport bounds
            const maxX = window.innerWidth - (windowRef.current?.offsetWidth || 200)
            const maxY = window.innerHeight - (windowRef.current?.offsetHeight || 100)

            setPosition({
                x: Math.max(0, Math.min(newX, maxX)),
                y: Math.max(0, Math.min(newY, maxY)),
            })
        },
        [isDragging, dragStart],
    )

    const handleMouseUp = useCallback(() => {
        setIsDragging(false)
    }, [])

    // Add/remove global mouse event listeners
    React.useEffect(() => {
        if (isDragging) {
            document.addEventListener("mousemove", handleMouseMove)
            document.addEventListener("mouseup", handleMouseUp)
            document.body.style.userSelect = "none" // Prevent text selection while dragging
        }

        return () => {
            document.removeEventListener("mousemove", handleMouseMove)
            document.removeEventListener("mouseup", handleMouseUp)
            document.body.style.userSelect = "auto"
        }
    }, [isDragging, handleMouseMove, handleMouseUp])

    if (!DEBUG_BUILD) return

    return (
        <ClientOnly>
            <div
                ref={windowRef}
                className={`fixed z-50 bg-black/80 text-white text-xs p-2 rounded font-mono transition-shadow ${
                    isDragging ? "shadow-lg cursor-grabbing" : "cursor-grab hover:shadow-md"
                }`}
                style={{
                    left: `${position.x}px`,
                    top: `${position.y}px`,
                }}
                onMouseDown={handleMouseDown}
            >
                {children}
            </div>
        </ClientOnly>
    )
}
