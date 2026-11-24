import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getRequestUser } from "@/lib/auth";
import { createCorsHeaders } from "@/lib/helpers";

export async function GET(req: Request) {
  const user = getRequestUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: createCorsHeaders() });
  const { id, email, name, role, credits } = user;
  return NextResponse.json({ user: { id, email, name, role, credits } }, { headers: createCorsHeaders() });
}

export async function PATCH(req: Request) {
  const user = getRequestUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: createCorsHeaders() });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400, headers: createCorsHeaders() });
  }
  if (!body || typeof body !== "object" || !("name" in body) || typeof body.name !== "string") {
    return NextResponse.json({ error: "A name is required" }, { status: 400, headers: createCorsHeaders() });
  }
  const name = body.name.trim();
  if (!name || name.length > 80) {
    return NextResponse.json({ error: "Name must be between 1 and 80 characters" }, { status: 400, headers: createCorsHeaders() });
  }

  const updated = db.updateUser(user.id, { name });
  if (!updated) return NextResponse.json({ error: "Profile not found" }, { status: 404, headers: createCorsHeaders() });
  const { id, email, role, credits } = updated;
  return NextResponse.json({ message: "Profile updated", user: { id, email, name: updated.name, role, credits } }, { headers: createCorsHeaders() });
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: createCorsHeaders() });
}
