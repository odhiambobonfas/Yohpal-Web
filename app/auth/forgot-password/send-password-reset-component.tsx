"use client"
import "@/app/globals.css"
import { LucideLoader2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { FormEvent, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useEmailAuth } from "@/hooks/auth/use-email-auth"
import { toast } from "sonner"

export default function SendPasswordResetComponent() {
    const [email, setEmail] = useState("")

    const { loading, error, sendPasswordResetLink } = useEmailAuth()

    const handleSendResetLink = async (e: FormEvent) => {
        e.preventDefault()

        await sendPasswordResetLink(email)
        if (!error) {
            toast.success("Reset code has been sent")
        }
    }
    return (
        <div className="h-screen flex items-center justify-center">
            <div className="w-full md:w-4/6 items-center min-h-full md:min-h-[40svh] drop-shadow-2xl rounded-lg bg-background grid grid-cols-1 md:grid-cols-2 overflow-hidden">
                <div className="col-span-1 p-5 flex flex-col my-2 gap-5">
                    <div className="min-h-24 flex items-center flex-col gap-2 py-3">
                        <Image width={50} height={50} src="/logo_circular.png" alt="Yohpal logo" />
                        <h4 className="text-4xl font-semibold">YOHPAL</h4>
                        <h5 className="text-lg">Welcome to Yohpal website!</h5>
                    </div>
                    {error && <span className="text-red-500">{error}</span>}
                    <form onSubmit={handleSendResetLink} className="w-full flex flex-col gap-5">
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
                        <Button className="w-full hover:scale-100 text-primary-foreground font-semibold text-lg p-3">
                            {loading && <LucideLoader2 className="animate-spin" />}
                            {loading ? "Sending Link..." : "Reset password"}
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
