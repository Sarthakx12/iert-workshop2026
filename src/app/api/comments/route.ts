import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createCorsHeaders } from "@/lib/helpers";
import { getRequestUser } from "@/lib/auth";

export async function GET() {
  try {
    const comments = db.getComments();
    return NextResponse.json({ comments }, { headers: createCorsHeaders() });
  } catch {
    return NextResponse.json({ error: "Unable to load comments" }, { status: 500, headers: createCorsHeaders() });
  }
}

export async function POST(req: Request) {
  try {
    const user = getRequestUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: createCorsHeaders() });
    const body: unknown = await req.json();
    if (!body || typeof body !== "object" || !("body" in body) || typeof body.body !== "string") {
      return NextResponse.json({ error: "Comment body is required" }, { status: 400, headers: createCorsHeaders() });
    }
    const commentBody = body.body.trim();
    if (!commentBody || commentBody.length > 2000) {
      return NextResponse.json({ error: "Comments must be between 1 and 2000 characters" }, { status: 400, headers: createCorsHeaders() });
    }
    const newComment = db.addComment(user.name, commentBody);

    return NextResponse.json({ comment: newComment }, { status: 201, headers: createCorsHeaders() });
  } catch {
    return NextResponse.json({ error: "Unable to save comment" }, { status: 500, headers: createCorsHeaders() });
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: createCorsHeaders() });
}
