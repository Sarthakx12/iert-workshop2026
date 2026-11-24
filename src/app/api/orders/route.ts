import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createCorsHeaders } from "@/lib/helpers";
import { getRequestUser } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const currentUser = getRequestUser(req);
    if (!currentUser) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401, headers: createCorsHeaders() });
    }

    const orders = db.getOrdersByUserId(currentUser.id);
    return NextResponse.json({ orders }, { headers: createCorsHeaders() });
  } catch {
    return NextResponse.json({ error: "Unable to load orders" }, { status: 500, headers: createCorsHeaders() });
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: createCorsHeaders() });
}
