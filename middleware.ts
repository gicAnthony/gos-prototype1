import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const loggedIn = request.cookies.get("gos_session")?.value === "demo-session";
  if ((request.nextUrl.pathname.startsWith("/workspace") || request.nextUrl.pathname.startsWith("/select-tenant")) && !loggedIn) return NextResponse.redirect(new URL("/login", request.url));
  if (request.nextUrl.pathname === "/login" && loggedIn) return NextResponse.redirect(new URL("/select-tenant", request.url));
  return NextResponse.next();
}

export const config = { matcher: ["/login", "/workspace/:path*", "/select-tenant"] };
