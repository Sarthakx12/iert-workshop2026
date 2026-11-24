import { NextResponse } from "next/server";
import { createCorsHeaders } from "@/lib/helpers";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const cookie = req.headers.get("cookie")?.split(";").map((part) => part.trim()).find((part) => part.startsWith("flowvault_session="));
  const token = cookie?.slice("flowvault_session=".length);
  if (token) {
    try {
      db.deleteSession(decodeURIComponent(token));
    } catch {
      // Expire the browser cookie even if its value is malformed.
    }
  }
  const response = NextResponse.json({ message: "Logged out" }, { headers: createCorsHeaders() });
  response.cookies.set("flowvault_session", "", {
    path: "/", httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 0,
  });
  return response;
}
