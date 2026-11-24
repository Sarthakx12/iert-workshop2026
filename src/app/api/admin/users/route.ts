import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getRequestUser, isAdmin } from "@/lib/auth";
import { createCorsHeaders } from "@/lib/helpers";

export async function GET(req: Request) {
  const user = getRequestUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: createCorsHeaders() });
  if (!isAdmin(user)) return NextResponse.json({ error: "Forbidden" }, { status: 403, headers: createCorsHeaders() });

  const users = db.getAllUsers().map(({ id, email, name, role, credits }) => ({ id, email, name, role, credits }));
  return NextResponse.json({ admin_panel: true, users, total_count: users.length }, { headers: createCorsHeaders() });
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: createCorsHeaders() });
}
