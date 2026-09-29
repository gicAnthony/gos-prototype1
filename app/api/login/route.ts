import { NextResponse } from "next/server";
import { authenticate } from "@/lib/db";

export async function POST(request: Request) {
  const body = await request.json();
  const user = authenticate(body.email ?? "", body.password ?? "");
  if (!user) {
    return NextResponse.json({ message: "The email or password is incorrect." }, { status: 401 });
  }
  const response = NextResponse.json({ user });
  response.cookies.set("gos_session", "demo-session", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 8 });
  return response;
}
