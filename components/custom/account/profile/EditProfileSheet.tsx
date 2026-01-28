"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Upload, X, Loader2, Building2, ImageIcon } from "lucide-react"
import { BusinessProfile } from "@/types/users"
import { useEditProfile } from "@/hooks/account/useEditProfile"
import { BUSINESS_CATEGORIES, MAX_DESCRIPTION_LENGTH } from "@/components/custom/account/onboarding/types"

interface EditProfileSheetProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    profile: BusinessProfile
    userId: string
    onSuccess?: () => void
}

export function EditProfileSheet({
    open,
    onOpenChange,
    profile,
    userId,
    onSuccess,
}: EditProfileSheetProps) {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [showDiscardDialog, setShowDiscardDialog] = useState(false)

    const {
        formData,
        updateField,
        isDirty,
        isValid,
        isSubmitting,
        isUploadingLogo,
        displayLogo,
        uploadLogo,
        removeLogo,
        submit,
        reset,
    } = useEditProfile({
        profile,
        userId,
        onSuccess: () => {
            onOpenChange(false)
            onSuccess?.()
        },
    })

    const handleLogoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        await uploadLogo(file)
    }

    const handleOpenChange = (open: boolean) => {
        if (!open && isDirty) {
            setShowDiscardDialog(true)
            return
        }
        onOpenChange(open)
    }

    const handleDiscard = () => {
        reset()
        setShowDiscardDialog(false)
        onOpenChange(false)
    }

    const handleCancel = () => {
        if (isDirty) {
            setShowDiscardDialog(true)
            return
        }
        onOpenChange(false)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        await submit()
    }

    return (
        <>
        <Sheet open={open} onOpenChange={handleOpenChange}>
            <SheetContent
                side="right"
                className="w-full sm:max-w-lg overflow-y-auto flex flex-col"
            >
                <SheetHeader className="space-y-1 pb-6 border-b">
                    <SheetTitle className="text-xl flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-primary" />
                        Edit Business Profile
                    </SheetTitle>
                    <SheetDescription>
                        Update your business information visible to customers.
                    </SheetDescription>
                </SheetHeader>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                    <div className="py-6 space-y-8">
                        {/* Logo Upload Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <ImageIcon className="h-4 w-4 text-muted-foreground" />
                                <Label className="text-sm font-medium">Business Logo</Label>
                            </div>
                            <div className="flex items-center gap-6 p-4 rounded-lg bg-muted/50 border border-dashed">
                                {displayLogo ? (
                                    <div className="relative group">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={displayLogo}
                                            alt="Business logo preview"
                                            className="h-24 w-24 rounded-xl object-cover border-2 border-background shadow-sm"
                                        />
                                        <button
                                            type="button"
                                            onClick={removeLogo}
                                            className="absolute -top-2 -right-2 p-1.5 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-colors shadow-sm"
                                        >
                                            <X className="size-3.5" />
                                        </button>
                                    </div>
                                ) : (
                                    <Avatar className="h-24 w-24 rounded-xl border-2 border-dashed border-muted-foreground/25">
                                        <AvatarImage src="" />
                                        <AvatarFallback className="rounded-xl text-xl bg-muted text-muted-foreground">
                                            {formData.businessName.slice(0, 2).toUpperCase() || "BP"}
                                        </AvatarFallback>
                                    </Avatar>
                                )}
                                <div className="flex-1 space-y-2">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/jpeg,image/png,image/gif,image/webp"
                                        onChange={handleLogoSelect}
                                        className="hidden"
                                        id="edit-logo-upload"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isUploadingLogo}
                                        className="w-full h-10"
                                    >
                                        {isUploadingLogo ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Uploading...
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="mr-2 h-4 w-4" />
                                                {displayLogo ? "Change Logo" : "Upload Logo"}
                                            </>
                                        )}
                                    </Button>
                                    <p className="text-xs text-muted-foreground text-center">
                                        JPEG, PNG, GIF, or WebP. Max 5MB.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Business Details Section */}
                        <div className="space-y-5">
                            {/* Business Name */}
                            <div className="space-y-2">
                                <Label htmlFor="businessName" className="text-sm font-medium">
                                    Business Name <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="businessName"
                                    value={formData.businessName}
                                    onChange={(e) => updateField("businessName", e.target.value)}
                                    placeholder="Enter your business name"
                                    className="h-11"
                                />
                            </div>

                            {/* Category */}
                            <div className="space-y-2">
                                <Label htmlFor="category" className="text-sm font-medium">
                                    Category <span className="text-destructive">*</span>
                                </Label>
                                <Select
                                    value={formData.category}
                                    onValueChange={(value) => updateField("category", value)}
                                >
                                    <SelectTrigger className="w-full h-11">
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {BUSINESS_CATEGORIES.map((category) => (
                                            <SelectItem key={category.value} value={category.value}>
                                                {category.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Business Description */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <Label htmlFor="businessDescription" className="text-sm font-medium">
                                        Description <span className="text-destructive">*</span>
                                    </Label>
                                    <span className={`text-xs ${
                                        formData.businessDescription.length > MAX_DESCRIPTION_LENGTH - 50
                                            ? "text-amber-500"
                                            : "text-muted-foreground"
                                    }`}>
                                        {formData.businessDescription.length}/{MAX_DESCRIPTION_LENGTH}
                                    </span>
                                </div>
                                <Textarea
                                    id="businessDescription"
                                    value={formData.businessDescription}
                                    onChange={(e) => updateField("businessDescription", e.target.value)}
                                    placeholder="Tell customers about your business, what you offer, and what makes you unique..."
                                    rows={5}
                                    maxLength={MAX_DESCRIPTION_LENGTH}
                                    className="resize-none"
                                />
                            </div>

                            {/* Contact Info */}
                            <div className="space-y-2">
                                <Label htmlFor="contactInfo" className="text-sm font-medium">
                                    Contact Info <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="contactInfo"
                                    value={formData.contactInfo}
                                    onChange={(e) => updateField("contactInfo", e.target.value)}
                                    placeholder="Email address or phone number"
                                    className="h-11"
                                />
                                <p className="text-xs text-muted-foreground">
                                    This will be visible to customers who want to reach you.
                                </p>
                            </div>
                        </div>
                    </div>
                </form>

                <SheetFooter className="flex-shrink-0 pt-4 border-t gap-3 sm:gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                        disabled={isSubmitting}
                        className="flex-1 sm:flex-none"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        onClick={handleSubmit}
                        disabled={isSubmitting || !isDirty || !isValid}
                        className="flex-1 sm:flex-none min-w-[140px]"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            "Save Changes"
                        )}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>

        <AlertDialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Discard changes?</AlertDialogTitle>
                    <AlertDialogDescription>
                        You have unsaved changes that will be lost if you close this panel.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Keep Editing</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDiscard}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        Discard
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        </>
    )
}
