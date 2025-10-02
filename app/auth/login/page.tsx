"use client"
import "@/app/globals.css"
import { LucideEye, LucideEyeOff, LucideLoader } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FormEvent, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useEmailAuth } from "@/hooks/auth/use-email-auth"
import { toast } from "sonner"

export default function Page() {
    const router = useRouter()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const { loading, error, login } = useEmailAuth()

    const handleLogin = async (e: FormEvent) => {
        e.preventDefault()
        if (!email || !password) {
            return
        }
        const { success } = await login({ email, password })

        if (success) {
            toast.success("Login successfull")
            router.push("/")
        }
    }

    const [showPassword, setShowPassword] = useState(false)
    return (
        <div className="h-screen flex items-center justify-center">
            <div className="w-full md:w-4/6 min-h-full items-center  md:min-h-[40svh] drop-shadow-2xl rounded-lg bg-background grid grid-cols-1 md:grid-cols-2 overflow-hidden">
                <div className="col-span-1 p-5 flex flex-col my-2 gap-5">
                    <div className="min-h-24 flex items-center flex-col gap-2 py-3">
                        <Image width={50} height={50} src="/logo_circular.png" alt="Yohpal logo" />
                        <h4 className="text-4xl font-semibold">YOHPAL</h4>
                        <h5 className="text-lg">Welcome to Yohpal website!</h5>
                    </div>
                    {error && <span className="text-red-500">{error}</span>}
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
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Input
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
                        <Button className="w-full text-primary-foreground font-semibold text-lg p-3">
                            {loading && <LucideLoader className="animate-spin" />}
                            {loading ? "Signin In..." : "Sign In"}
                        </Button>

                        <div className="flex items-center text-muted-foreground my-4">
                            <hr className="flex-grow" />
                            <span className="px-3">Dont have an account?</span>
                            <hr className="flex-grow" />
                        </div>
                        <p className="text-center">
                            <Link
                                href="/auth/register"
                                className="hover:underline text-accent-foreground"
                            >
                                Sign up
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
