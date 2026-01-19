"use client"

import { useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Loader2, Upload, X, ImageIcon } from "lucide-react"

interface AdImageUploadProps {
    imageUrl: string | null
    preview: string | null
    loading: boolean
    onUpload: (file: File) => void
    onRemove: () => void
    error?: string | null
}

export function AdImageUpload({
    imageUrl,
    preview,
    loading,
    onUpload,
    onRemove,
    error,
}: AdImageUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            onUpload(file)
        }
    }

    const displayImage = preview || imageUrl

    return (
        <div className="space-y-2">
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleFileSelect}
                className="hidden"
            />

            {displayImage ? (
                <div className="relative aspect-video rounded-lg border overflow-hidden bg-muted">
                    <Image
                        src={displayImage}
                        alt="Ad preview"
                        fill
                        className="object-cover"
                    />
                    <button
                        type="button"
                        onClick={onRemove}
                        className="absolute top-2 right-2 p-1.5 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
                    >
                        <X className="size-4" />
                    </button>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                    className="relative w-full aspect-video rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground"
                >
                    {loading ? (
                        <>
                            <Loader2 className="size-8 animate-spin" />
                            <span>Uploading...</span>
                        </>
                    ) : (
                        <>
                            <ImageIcon className="size-8" />
                            <span>Click to upload ad image</span>
                            <span className="text-xs">JPEG, PNG, GIF, WebP (max 10MB)</span>
                        </>
                    )}
                </button>
            )}

            {error && (
                <p className="text-sm text-destructive">{error}</p>
            )}

            {displayImage && (
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                    className="w-full"
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 size-4 animate-spin" />
                            Uploading...
                        </>
                    ) : (
                        <>
                            <Upload className="mr-2 size-4" />
                            Change Image
                        </>
                    )}
                </Button>
            )}
        </div>
    )
}
