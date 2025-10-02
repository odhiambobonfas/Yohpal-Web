"use server"

import { COOKIES } from "@/constants"

import { createCookie, removeCookie } from "./cookies"

export const createSession = async (session: { token: string; uid: string }) => {
    await createCookie({ name: COOKIES.Session, value: session.token })
    await createCookie({ name: COOKIES.User, value: session.uid })
}

export const destroySession = async () => await removeCookie(COOKIES.Session)
