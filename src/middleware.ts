export { default } from "next-auth/middleware"
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|signin|favicon.ico).*)"],
}
