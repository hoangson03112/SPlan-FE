import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_PATHS = ["/login", "/register"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthenticated = request.cookies.has("access_token");

  if (pathname.startsWith("/workspaces") && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (AUTH_PATHS.includes(pathname) && isAuthenticated) {
    return NextResponse.redirect(new URL("/workspaces", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/workspaces/:path*", "/login", "/register"],
};
