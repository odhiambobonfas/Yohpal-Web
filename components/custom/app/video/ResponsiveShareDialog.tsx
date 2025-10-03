"use client"

import { LucideCopy } from "lucide-react"
import * as React from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { useIsMobile } from "@/hooks/use-mobile"

export function ResponsiveShareDialog({
    children,
    videoId,
    onAction,
}: {
    videoId: string
    children: React.ReactNode
    onAction: () => void
}) {
    const [open, setOpen] = React.useState(false)
    const isMobile = useIsMobile()
    const [shareLink, setShareLink] = React.useState("")

    React.useEffect(() => {
        if (typeof window !== "undefined") {
            const currentUrl = new URL(window.location.href)
            currentUrl.searchParams.delete("u")
            currentUrl.searchParams.set("v", videoId)
            setShareLink(currentUrl.toString())
        }
    }, [videoId])
    const dialogTitle = "Share"
    const dialogDescription = "Copy the link below to share this video."

    const handleCopy = async () => {
        if (!window) return
        await window.navigator.clipboard.writeText(shareLink)
        toast.success("Link copied to clipboard")
        onAction()
        setOpen(false)
    }

    if (isMobile) {
        return (
            <Drawer open={open} onOpenChange={setOpen}>
                <DrawerTrigger asChild>{children}</DrawerTrigger>
                <DrawerContent>
                    <DrawerHeader className="text-left">
                        <DrawerTitle>{dialogTitle}</DrawerTitle>
                        <DrawerDescription>{dialogDescription}</DrawerDescription>
                    </DrawerHeader>

                    <div className="w-full flex items-center justify-center p-3">
                        <Input
                            value={shareLink}
                            readOnly
                            aria-selected
                            className="text-xs font-mono"
                        />
                    </div>
                    <DrawerFooter className="mb-10 p-2">
                        <Button onClick={handleCopy}>Copy</Button>
                        <DrawerClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DrawerClose>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        )
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{dialogTitle}</DialogTitle>
                    <DialogDescription>{dialogDescription}</DialogDescription>
                </DialogHeader>
                <Input value={shareLink} className="text-xs font-mono" readOnly aria-selected />
                <div className="flex w-full justify-end space-x-2 mt-4">
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleCopy}>
                        <LucideCopy /> Copy
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
