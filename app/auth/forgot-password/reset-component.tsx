"use client"
import "@/app/globals.css"
import { LucideEye, LucideEyeOff, LucideLoader2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FormEvent, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useEmailAuth } from "@/hooks/auth/use-email-auth"
import { toast } from "sonner"

export default function ResetPasswordComponent({ oobCode }: { oobCode: string }) {
    const router = useRouter()

    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")

    const [confirmError, setConfirmError] = useState<string | null>(null)

    const { loading, error, confirmPasswordReset } = useEmailAuth()

    const handlePasswordReset = async (e: FormEvent) => {
        e.preventDefault()

        if (password !== confirmPassword) {
            setConfirmError("Passwords don't match")
            return
        }

        if (!password) {
            toast.error("All fields are required")
            return
        }

        await confirmPasswordReset({ oobCode, newPassword: password })
        toast.success("Password reset successfully")
        router.replace("/auth/login")
    }
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    return (
        <div className="h-screen flex items-center justify-center">
            <div className="w-full md:w-4/6 items-center min-h-full md:min-h-[40svh] drop-shadow-2xl rounded-lg bg-background grid grid-cols-1 md:grid-cols-2 overflow-hidden">
                <div className="col-span-1 p-5 flex flex-col my-2 gap-5">
                    <div className="min-h-24 flex items-center flex-col gap-2 py-3">
                        <Image width={50} height={50} src="/logo_circular.png" alt="Yohpal logo" />
                        <h4 className="text-4xl font-semibold">YOHPAL</h4>
                        <h5 className="text-lg">Welcome to Yohpal website!</h5>
                    </div>
                    {(error || confirmError) && (
                        <span className="text-red-500">{error || confirmError}</span>
                    )}
                    <form onSubmit={handlePasswordReset} className="w-full flex flex-col gap-5">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="password">New Password</Label>
                            <div className="relative">
                                <Input
                                    minLength={8}
                                    name="password"
                                    onChange={(e) => setPassword(e.target.value)}
                                    type={showPassword ? "text" : "password"}
                                    placeholder="password"
                                    required
                                    className="text-lg pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-3 flex items-center text-muted-foreground"
                                >
                                    {showPassword ? (
                                        <LucideEyeOff size={20} />
                                    ) : (
                                        <LucideEye size={20} />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <div className="relative">
                                <Input
                                    name="confirmPassword"
                                    minLength={8}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="confirm password"
                                    required
                                    className="text-lg pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-3 flex items-center text-muted-foreground"
                                >
                                    {showConfirmPassword ? (
                                        <LucideEyeOff size={20} />
                                    ) : (
                                        <LucideEye size={20} />
                                    )}
                                </button>
                            </div>
                        </div>
                        <Button className="w-full hover:scale-100 text-primary-foreground font-semibold text-lg p-4">
                            {loading && <LucideLoader2 className="animate-spin" />}
                            {loading ? "Resetting..." : "Reset Password"}
                        </Button>

                        <div className="flex items-center text-muted-foreground my-4">
                            <hr className="flex-grow" />
                            <span className="px-3">Remembered your password?</span>
                            <hr className="flex-grow" />
                        </div>
                        <p className="text-center">
                            <Link
                                href="/auth/login"
                                className="hover:underline text-accent-foreground"
                            >
                                Sign In
                            </Link>
                        </p>
                    </form>
                </div>
                <div className="hidden h-full md:block col-span-1">
                    <Image
                        src="/app/auth-bg.jpg"
                        width={500}
                        height={500}
                        className="w-full h-full object-cover"
                        alt="Yohpal login background image"
                    />
                </div>
            </div>
        </div>
    )
}
