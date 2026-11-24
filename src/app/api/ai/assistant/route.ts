
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createCorsHeaders } from "@/lib/helpers";

/**
 * Secure deterministic mock AI assistant.
 * All data access is restricted to the authenticated user.
 */

export async function POST(req: Request) {
  const headers = createCorsHeaders();

  try {
    // 1. Authenticate user
    const cookieHeader = req.headers.get("cookie") || "";
    const sessionMatch = cookieHeader.match(/flowvault_session=([^;]+)/);
    const authHeader = req.headers.get("authorization");
    const token = sessionMatch
      ? sessionMatch[1]
      : authHeader?.replace(/^Bearer\s+/i, "");

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers }
      );
    }

    const currentUser = db.getUserBySession(token);

    if (!currentUser) {
      return NextResponse.json(
        { error: "Invalid session" },
        { status: 401, headers }
      );
    }

    // 2. Validate request body
    let body: any;

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400, headers }
      );
    }

    if (
      !body ||
      typeof body.prompt !== "string" ||
      !body.prompt.trim()
    ) {
      return NextResponse.json(
        { error: "A valid prompt is required" },
        { status: 400, headers }
      );
    }

    const userPrompt = body.prompt.trim();

    if (userPrompt.length > 2000) {
      return NextResponse.json(
        { error: "Prompt exceeds maximum length" },
        { status: 400, headers }
      );
    }

    // 3. Strictly user-scoped data access.
    // Never expose database-wide notes to the assistant.
    const userNotes = db.getNotesByUserId(currentUser.id);

    // 4. Deterministic response.
    // User input cannot select privileged tools or change authorization.
    return NextResponse.json(
      {
        model: "flowvault-secure-mock-v1",
        tool_called: "getUserNotes()",
        over_permissioned_tool_used: false,
        response:
          `Hello ${currentUser.name}! You currently have ${userNotes.length} note(s) in your vault:\n\n` +
          userNotes
            .map((note) => `- ${note.title}: ${note.content}`)
            .join("\n"),
        tokens_used: 120,
        spend_cents: 0,
      },
      { headers }
    );
  } catch (error) {
    console.error("[AI_ASSISTANT_ERROR]", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: createCorsHeaders(),
  });
}
