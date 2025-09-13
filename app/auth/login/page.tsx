"use client"
import Image from "next/image"
import "@/app/globals.css"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
export default function Page() {
    return (
        <div className="flex w-screen h-screen align-middle items-center justify-center">
            <div className="flex flex-row  bg-background w-full md:w-2/3 md:m-8  align-middle justify-center m-0 shadow-xl">
                <div className="bg-background w-full md:w-1/2">
                    <div className="h-full p-10">
                        <div className="">
                            <form className="" action="">
                                <h4 className="text-foreground mb-4">YOHPAL</h4>
                                <h5 className="mb-3 text-start">Welcome back to Yohpal website!</h5>
                                <div className="mb-4 flex flex-col">
                                    <label
                                        className="block mb-2 text-sm font-medium text-muted-foreground"
                                        htmlFor="email"
                                    >
                                        EMAIL ADDRESS
                                    </label>
                                    <Input
                                        type="text"
                                        placeholder="xyz@gmail.com"
                                        className="w-full rounded-md border border-gray-300 p-2 text-sm text-gray-900"
                                    />
                                </div>
                                <div className="mb-4 flex flex-col">
                                    <label
                                        className="block mb-2 mt-2 text-sm font-medium text-muted-foreground"
                                        htmlFor="email"
                                    >
                                        PASSWORD
                                    </label>
                                    <Input type="text" placeholder="Enter Password" />
                                </div>
                                <div className="flex align-middle justify-between mb-3">
                                    <div className="flex items-center mb-4">
                                        <label
                                            htmlFor="remember"
                                            className="ml-2 text-sm text-gray-700"
                                        >
                                            <Checkbox
                                                defaultChecked
                                                className="
                                                    size-4 mr-2 rounded border border-gray-400
                                                    data-[state=checked]:bg-red-600
                                                    data-[state=checked]:border-red-600
                                                    data-[state=checked]:text-white
                                                    dark:data-[state=checked]:bg-red-700
                                                    dark:data-[state=checked]:border-red-700
                                                    dark:data-[state=checked]:text-white
                                                "
                                            />
                                            Remember Password
                                        </label>
                                    </div>
                                    <div className="mt-4 text-sm text-gray-600">
                                        <p className="font-bold">
                                            <Link href="#" className="text-accent-foreground">
                                                Forgot Your Password
                                            </Link>
                                        </p>
                                    </div>
                                </div>
                                <div className="mb-4 flex flex-col">
                                    <Button>Login</Button>
                                </div>
                            </form>
                        </div>
                        <div className="flex items-center text-muted-foreground my-4">
                            <hr className="flex-grow" />
                            <span className="px-3">Dont have an account?</span>
                            <hr className="flex-grow" />
                        </div>
                        <p className="text-center">
                            <Link href="/auth/register" className="text-accent-foreground">
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>
                <div className="hidden md:block bg-primary fill w-1/2 relative">
                    <Image
                        src="/app/auth-bg.jpg"
                        fill
                        alt="Auth page image placeholder"
                        className="object-cover"
                    />
                </div>
            </div>
        </div>
    )
}
