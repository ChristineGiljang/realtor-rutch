import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");
  const isLoginPage = req.nextUrl.pathname === "/admin/login";

  if (isAdminRoute && !isLoginPage && !isLoggedIn) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  if (isLoginPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/admin/listings", req.url));
  }
});

export const config = {
  matcher: ["/admin/:path*"],
};
