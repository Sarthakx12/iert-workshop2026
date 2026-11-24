import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createCorsHeaders } from "@/lib/helpers";

export async function POST(req: Request) {
  try {
    const body: unknown = await req.json();
    if (!body || typeof body !== "object" || !("email" in body) || !("password" in body)) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }
    const { email, password } = body as { email: unknown; password: unknown };
    if (typeof email !== "string" || typeof password !== "string" || email.length > 254 || password.length > 256) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 400 });
    }

    const user = db.verifyPassword(email, password);
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401, headers: createCorsHeaders() }
      );
    }

    const token = db.createSession(user.id);

    const response = NextResponse.json(
      {
        message: "Authentication successful",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          credits: user.credits,
        },
      },
      { status: 200, headers: createCorsHeaders() }
    );

    // Set session cookies
    response.cookies.set("flowvault_session", token, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 8,
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: createCorsHeaders() });
}
