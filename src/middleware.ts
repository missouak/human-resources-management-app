import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import { withAuth } from "next-auth/middleware"

export default withAuth(async function middleware(req) {
  const token = await getToken({ req })
  if (token?.role === "superAdmin" && req.nextUrl.pathname === "/") {
    const dashboard = new URL("/dashboard", req.url)
    return NextResponse.redirect(dashboard)
  }
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|signin|favicon.ico).*)"],
}
