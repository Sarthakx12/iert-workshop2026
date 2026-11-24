import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getRequestUser } from "@/lib/auth";
import { createCorsHeaders } from "@/lib/helpers";

export async function POST(req: Request) {
  const user = getRequestUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: createCorsHeaders() });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400, headers: createCorsHeaders() });
  }
  if (!body || typeof body !== "object" || !("code" in body) || typeof body.code !== "string") {
    return NextResponse.json({ error: "Coupon code is required" }, { status: 400, headers: createCorsHeaders() });
  }
  const code = body.code.trim();
  if (!code || code.length > 40) return NextResponse.json({ error: "Invalid coupon code" }, { status: 400, headers: createCorsHeaders() });

  const coupon = db.getCoupon(code);
  if (!coupon) return NextResponse.json({ error: "Invalid coupon code" }, { status: 404, headers: createCorsHeaders() });
  if (coupon.used_count >= coupon.max_uses || coupon.redeemed_by.includes(user.id)) {
    return NextResponse.json({ error: "Coupon has already been fully redeemed" }, { status: 409, headers: createCorsHeaders() });
  }

  try {
    // Keep the check and mutation in one synchronous database operation.
    const result = db.redeemCoupon(user.id, code, coupon.discount_credits);
    return NextResponse.json(
      { message: "Coupon redeemed successfully", credits_added: coupon.discount_credits, total_credits: result.credits, used_count: result.coupon.used_count },
      { headers: createCorsHeaders() }
    );
  } catch {
    return NextResponse.json({ error: "Coupon is no longer available" }, { status: 409, headers: createCorsHeaders() });
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: createCorsHeaders() });
}
