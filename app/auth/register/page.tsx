"use client"
import Image from "next/image"
import "@/app/globals.css"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
export default function Page() {
    return (
        <div className="flex w-screen h-screen align-middle items-center justify-center">
            <div className="flex flex-row  bg-background w-full md:w-1/2 m-0 md:m-8 align-middle justify-center  shadow-xl">
                <div className="bg-background w-full md:w-1/2">
                    <div className="h-full p-10">
                        <div className="">
                            <form className="" action="">
                                <h4 className="text-foreground mb-4">YOHPAL</h4>
                                <h5 className="mb-3 text-start">Welcome to Yohpal website!</h5>
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
                                <div className="mb-4 flex flex-col">
                                    <label
                                        className="block mb-2 mt-2 text-sm font-medium text-muted-foreground"
                                        htmlFor="email"
                                    >
                                        CONFIRM PASSWORD
                                    </label>
                                    <Input type="text" placeholder="Enter Password" />
                                </div>
                                <div className="mb-4 flex flex-col">
                                    <Button>Sign up</Button>
                                </div>
                            </form>
                        </div>
                        <div className="flex items-center text-muted-foreground my-4">
                            <hr className="flex-grow" />
                            <span className="px-3">Already have an account?</span>
                            <hr className="flex-grow" />
                        </div>
                        <p className="text-center">
                            <Link href="/auth/login" className="text-accent-foreground">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
                <div className="hidden md:block bg-primary fill w-1/2 relative">
                    <Image
                        src="/auth-bg.jpg"
                        fill
                        alt="Auth page image placeholder"
                        className="object-cover"
                    />
                </div>
            </div>
        </div>
    )
}
