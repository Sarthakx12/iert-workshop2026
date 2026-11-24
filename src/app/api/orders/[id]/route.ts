import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getRequestUser, isAdmin } from "@/lib/auth";
import { createCorsHeaders } from "@/lib/helpers";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const currentUser = getRequestUser(req);
    if (!currentUser) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401, headers: createCorsHeaders() });
    }

    const order = db.getOrderById(id);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404, headers: createCorsHeaders() });
    }

    if (order.user_id !== currentUser.id && !isAdmin(currentUser)) {
      return NextResponse.json({ error: "Order not found" }, { status: 404, headers: createCorsHeaders() });
    }

    return NextResponse.json(
      {
        order,
        accessed_by: currentUser.email,
      },
      { headers: createCorsHeaders() }
    );
  } catch {
    return NextResponse.json({ error: "Unable to load order" }, { status: 500, headers: createCorsHeaders() });
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: createCorsHeaders() });
}
