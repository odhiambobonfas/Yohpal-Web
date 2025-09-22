"use client"
import Image from "next/image"
import Link from "next/link"
import "@/app/globals.css"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FormEvent, useState } from "react"
import { useEmailAuth } from "@/hooks/auth/use-email-auth"
import { LucideLoader } from "lucide-react"
import { useRouter } from "next/navigation"

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
        if (success) router.push("/")
    }

    return (
        <div className="h-screen flex items-center justify-center">
            <div className="w-full md:w-4/6 min-h-full md:min-h-[40svh] drop-shadow-2xl rounded-lg bg-background grid grid-cols-1 md:grid-cols-2 overflow-hidden">
                <div className="col-span-1 p-5 flex flex-col my-2 gap-5">
                    <div className="min-h-24 flex flex-col gap-2 py-3">
                        <h4 className="text-4xl font-semibold">YOHPAL</h4>
                        <h5 className="text-lg">Welcome back to Yohpal website!</h5>
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
                            <Input
                                onChange={(e) => setPassword(e.target.value)}
                                type="password"
                                placeholder="password"
                                required
                                className="text-lg"
                            />
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
