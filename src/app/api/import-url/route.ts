import { NextResponse } from "next/server";
import { getRequestUser } from "@/lib/auth";
import { createCorsHeaders } from "@/lib/helpers";
import { safeFetchUrl } from "@/lib/safe-url";

export async function POST(req: Request) {
  if (!getRequestUser(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: createCorsHeaders() });
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400, headers: createCorsHeaders() });
  }
  if (!body || typeof body !== "object" || !("url" in body) || typeof body.url !== "string" || body.url.length > 2048) {
    return NextResponse.json({ error: "A valid URL is required" }, { status: 400, headers: createCorsHeaders() });
  }

  try {
    const result = await safeFetchUrl(body.url);
    return NextResponse.json(
      { url: new URL(body.url).toString(), status: result.status, content_type: result.contentType, content: result.body },
      { headers: createCorsHeaders() }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Import failed";
    const status = message.includes("allowlist") || message.includes("Only credential-free") || message.includes("non-public") ? 400 : 502;
    return NextResponse.json({ error: message }, { status, headers: createCorsHeaders() });
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: createCorsHeaders() });
}
