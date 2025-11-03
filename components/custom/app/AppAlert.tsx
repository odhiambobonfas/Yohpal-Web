"use client"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"
import { AlertCircle, Info, TriangleAlert } from "lucide-react"

interface AlertProps {
    type: "warn" | "error" | "info" | "confirm"
    isOpen: boolean
    onClose?: () => void
    onAction?: () => void
    title: string
    description?: string
    actionText?: string
    cancelText?: string
    showCancel?: boolean
}

export default function AppAlert({
    type,
    isOpen,
    onClose,
    onAction,
    title,
    description = "",
    actionText = "OK",
    cancelText = "Cancel",
    showCancel = type === "confirm" || cancelText.length > 0,
}: AlertProps) {
    const config = alertConfig[type]
    const IconComponent = config.icon

    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader className="items-center text-center">
                    <div
                        className={cn(
                            config.bgColor,
                            "size-12 rounded-full flex items-center justify-center",
                        )}
                    >
                        <IconComponent className={`size-6 ${config.iconColor}`} />
                    </div>
                    <AlertDialogTitle className="text-lg font-semibold">{title}</AlertDialogTitle>
                    <AlertDialogDescription className="text-muted-foreground wrap-anywhere">
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter className="items-center flex w-full justify-center flex-row gap-2">
                    {showCancel && (
                        <AlertDialogCancel onClick={onClose} className="w-auto flex-1">
                            {cancelText}
                        </AlertDialogCancel>
                    )}
                    <AlertDialogAction onClick={onAction || onClose} className="w-auto flex-1">
                        {actionText}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

const alertConfig = {
    warn: {
        icon: TriangleAlert,
        iconColor: "text-amber-600",
        bgColor: "bg-amber-50",
    },
    error: {
        icon: AlertCircle,
        iconColor: "text-red-600",
        bgColor: "bg-red-50",
    },
    info: {
        icon: Info,
        iconColor: "text-blue-600",
        bgColor: "bg-blue-50",
    },
    confirm: {
        icon: AlertCircle,
        iconColor: "text-gray-600",
        bgColor: "bg-gray-50",
    },
}
