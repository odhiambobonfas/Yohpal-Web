"use server"

import { cookies } from "next/headers"

interface CustomCookie {
    name: string
    value: string
}

export async function createCookie(cookie: CustomCookie) {
    const cookieStore = await cookies()
    cookieStore.set({
        name: cookie.name,
        value: cookie.value,
        path: "/",
        httpOnly: true,
    })
}

export async function removeCookie(name: string) {
    const cookieStore = await cookies()
    cookieStore.delete(name)
}
