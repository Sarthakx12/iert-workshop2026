import { NextResponse } from "next/server";
import { getRequestUser } from "@/lib/auth";
import { createCorsHeaders } from "@/lib/helpers";

export async function GET(req: Request) {
  const user = getRequestUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401, headers: createCorsHeaders() });
  }

  const { id, email, name, role, credits } = user;
  return NextResponse.json({ user: { id, email, name, role, credits } }, { headers: createCorsHeaders() });
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: createCorsHeaders() });
}
