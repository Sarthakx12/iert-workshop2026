import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getRequestUser } from "@/lib/auth";
import { createCorsHeaders } from "@/lib/helpers";

export async function GET(req: Request) {
  const user = getRequestUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: createCorsHeaders() });
  const orders = db.getOrdersByUserId(user.id);
  return NextResponse.json(orders, {
    headers: { ...createCorsHeaders(), "Content-Range": `0-${Math.max(orders.length - 1, 0)}/${orders.length}` },
  });
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: createCorsHeaders() });
}
