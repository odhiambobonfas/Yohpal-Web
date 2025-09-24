import { type NextRequest, NextResponse } from "next/server"
import { COOKIES } from "./constants"

export async function middleware(request: NextRequest) {
    const cookieStore = request.cookies
    const isAuthed = cookieStore.has(COOKIES.Session)

    // they should be able to view the home page
    if (!isAuthed && request.nextUrl.pathname === "/") return NextResponse.next()

    if (!isAuthed && !request.nextUrl.pathname.startsWith("/auth")) {
        return NextResponse.redirect(new URL("/auth/login", request.url))
    }

    // if authed and already inside /auth/*, send them back to /
    if (isAuthed && request.nextUrl.pathname.startsWith("/auth")) {
        return NextResponse.redirect(new URL("/", request.url))
    }

    if (
        isAuthed &&
        cookieStore.has(COOKIES.EmailNotVerified) &&
        request.nextUrl.pathname !== "/onboarding"
    ) {
        return NextResponse.redirect(new URL("/onboarding", request.url))
    }

    return NextResponse.next()
}
export const config = {
    matcher: ["/profile", "/auth/:path*", "/", "/onboarding"],
}
