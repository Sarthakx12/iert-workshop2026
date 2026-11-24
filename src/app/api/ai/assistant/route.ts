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
  if (!body || typeof body !== "object" || !("prompt" in body) || typeof body.prompt !== "string") {
    return NextResponse.json({ error: "A prompt is required" }, { status: 400, headers: createCorsHeaders() });
  }
  const prompt = body.prompt.trim();
  if (!prompt || prompt.length > 2000) {
    return NextResponse.json({ error: "Prompt must be between 1 and 2000 characters" }, { status: 400, headers: createCorsHeaders() });
  }

  // This mock has no model or paid tools. Any retrieved context is scoped to the authenticated owner.
  const notes = db.getNotesByUserId(user.id);
  const response = notes.length
    ? `Your workspace has ${notes.length} note(s):\n${notes.map((note) => `- ${note.title}: ${note.content}`).join("\n")}`
    : "Your workspace has no notes yet.";
  return NextResponse.json(
    { model: "flowvault-deterministic-mock-v1", tool_called: "getUserNotes()", response, tokens_used: 0, spend_cents: 0 },
    { headers: createCorsHeaders() }
  );
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: createCorsHeaders() });
}
