"use server"

import { COOKIES } from "@/constants"
import { createCookie, removeCookie } from "./cookies"

export const createSession = async (token: string) => {
    await createCookie({ name: COOKIES.Session, value: token })
}

export const destroySession = async () => await removeCookie(COOKIES.Session)
