import { NextResponse } from "next/server"
import { authMiddleware } from "@clerk/nextjs"

export default authMiddleware({
  publicRoutes: ["/signin(.*)", "/api/webhooks(.*)"],
  afterAuth(auth, req) {
    if (auth.isPublicRoute) {
      return NextResponse.next()
    }
    const url = new URL(req.nextUrl.origin)
    if (!auth.userId) {
      url.pathname = "/signin"
      return NextResponse.redirect(url)
    }
  },
})

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api)(.*)"],
}
