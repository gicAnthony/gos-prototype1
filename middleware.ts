import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const loggedIn = request.cookies.get("gos_session")?.value === "demo-session";
  if (request.nextUrl.pathname.startsWith("/workspace") && !loggedIn) return NextResponse.redirect(new URL("/login", request.url));
  if (request.nextUrl.pathname === "/login" && loggedIn) return NextResponse.redirect(new URL("/workspace", request.url));
  return NextResponse.next();
}

export const config = { matcher: ["/login", "/workspace/:path*"] };
