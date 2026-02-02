import NextAuth from "next-auth"
import authConfig from "@/auth.config"
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

// Initialize Ratelimit if env vars are present
const redisUrl = process.env.UPSTASH_REDIS_REST_URL
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN

let ratelimit: Ratelimit | null = null

if (redisUrl && redisToken) {
    ratelimit = new Ratelimit({
        redis: new Redis({
            url: redisUrl,
            token: redisToken,
        }),
        limiter: Ratelimit.slidingWindow(10, "10 s"),
        analytics: true,
        prefix: "@upstash/ratelimit",
    })
}

export default auth(async (req) => {
    // 1. Rate Limiting for API routes
    if (req.nextUrl.pathname.startsWith("/api") && ratelimit) {
        const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1"
        const { success, pending, limit, reset, remaining } = await ratelimit.limit(ip)

        if (!success) {
            return NextResponse.json({ error: "Too Many Requests" }, { status: 429 })
        }
    }

    // 2. Auth Logic (Existing)
    const isLoggedIn = !!req.auth
    const isApiAuthRoute = req.nextUrl.pathname.startsWith("/api/auth")
    const isPublicRoute = ["/", "/login", "/register"].includes(req.nextUrl.pathname)
    const isAuthRoute = ["/login", "/register"].includes(req.nextUrl.pathname)

    if (isApiAuthRoute) {
        return
    }

    if (isAuthRoute) {
        if (isLoggedIn) {
            return Response.redirect(new URL("/workspaces", req.nextUrl))
        }
        return
    }

    if (!isLoggedIn && !isPublicRoute) {
        let callbackUrl = req.nextUrl.pathname;
        if (req.nextUrl.search) {
            callbackUrl += req.nextUrl.search;
        }

        const encodedCallbackUrl = encodeURIComponent(callbackUrl);
        return Response.redirect(new URL(`/login?callbackUrl=${encodedCallbackUrl}`, req.nextUrl))
    }

    return
})

export const config = {
    // Matcher updated to include /api routes for rate limiting, but exclude static assets
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
