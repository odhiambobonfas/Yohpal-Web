"use server"

import { COOKIES } from "@/constants"

import { createCookie, removeCookie } from "./cookies"

export const createSession = async (session: { token: string; uid: string }) => {
    await Promise.all([
        createCookie({ name: COOKIES.Session, value: session.token }),
        createCookie({ name: COOKIES.User, value: session.uid }),
    ])
}

export const destroySession = async () => {
    await Promise.all([removeCookie(COOKIES.Session), removeCookie(COOKIES.User)])
}
