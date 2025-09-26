"use client"
import Image from "next/image"
import Link from "next/link"
import "@/app/globals.css"
import { FormEvent, useState } from "react"
import { LucideLoader, LucideEye, LucideEyeOff } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useEmailAuth } from "@/hooks/auth/use-email-auth"

export default function Page() {
    const router = useRouter()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")

    const [confirmError, setConfirmError] = useState<string | null>(null)

    const { loading, error, login } = useEmailAuth()

    const handleLogin = async (e: FormEvent) => {
        e.preventDefault()

        if (password !== confirmPassword) {
            setConfirmError("Passwords don't match")
            return
        }

        if (!email || !password) {
            return
        }
        const { success } = await login({ email, password })
        if (success) router.push("/")
    }
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    return (
        <div className="h-screen flex items-center justify-center">
            <div className="w-full md:w-4/6 min-h-full md:min-h-[40svh] drop-shadow-2xl rounded-lg bg-background grid grid-cols-1 md:grid-cols-2 overflow-hidden">
                <div className="col-span-1 p-5 flex flex-col my-2 gap-5">
                    <div className="min-h-24 flex flex-col gap-2 py-3">
                        <h4 className="text-4xl font-semibold">YOHPAL</h4>
                        <h5 className="text-lg">Welcome to Yohpal website!</h5>
                    </div>
                    {(error || confirmError) && (
                        <span className="text-red-500">{error || confirmError}</span>
                    )}
                    <form onSubmit={handleLogin} className="w-full flex flex-col gap-5">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                onChange={(e) => setEmail(e.target.value)}
                                type="email"
                                placeholder="xyz@domain.com"
                                required
                                className="text-lg"
                            />
                        </div>
                        {/* Password */}
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Input
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
                        <Button className="w-full text-primary-foreground font-semibold text-lg p-3">
                            {loading && <LucideLoader className="animate-spin" />}
                            {loading ? "Registering..." : "Register"}
                        </Button>

                        <div className="flex items-center text-muted-foreground my-4">
                            <hr className="flex-grow" />
                            <span className="px-3">Have an account?</span>
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
                <div className="hidden md:block col-span-1">
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
