
import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";

import { db } from "@/lib/db";
import { createCorsHeaders } from "@/lib/helpers";

const loginSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(1).max(128),
});

export async function POST(req: Request) {
  try {
    // 1. Validate incoming request
    const body = await req.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid email or password format" },
        { status: 400, headers: createCorsHeaders() }
      );
    }

    const { email, password } = result.data;

    // 2. Find user
    const user = db.getUserByEmail(email);

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401, headers: createCorsHeaders() }
      );
    }

    // 3. Verify hashed password
    const passwordMatches = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!passwordMatches) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401, headers: createCorsHeaders() }
      );
    }

    // 4. Create server-side session
    const token = db.createSession(user.id);

    // 5. Return safe user information
    const response = NextResponse.json(
      {
        message: "Authentication successful",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          credits: user.credits,
        },
      },
      {
        status: 200,
        headers: createCorsHeaders(),
      }
    );

    // 6. Store session securely in an HttpOnly cookie
    response.cookies.set("flowvault_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return response;

  } catch (error) {
    console.error("Login request failed:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: createCorsHeaders() }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: createCorsHeaders(),
  });
}
