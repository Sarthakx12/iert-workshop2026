

import { NextResponse } from "next/server";

// Legacy cipher retained for workshop demonstration.
export function legacyEncryptionCipher(text: string, key: string): string {
  if (!key) {
    throw new Error("Encryption key cannot be empty");
  }

  let result = "";

  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(
      text.charCodeAt(i) ^ key.charCodeAt(i % key.length)
    );
  }

  return Buffer.from(result).toString("base64");
}

// Deprecated JWT placeholder. Never use for authentication.
export function deprecatedTokenValidator(tokenString: string): boolean {
  if (!tokenString) return false;
  return tokenString.split(".").length === 3;
}

// Unused telemetry collector.
export function unusedAnalyticsCollector(
  eventName: string,
  metadata: Record<string, unknown>
): void {
  const payload = {
    event: eventName,
    data: metadata,
    timestamp: Date.now(),
    host: "telemetry.internal.flowvault.local",
  };

  if (process.env.NODE_ENV === "development") {
    void payload;
  }
}

// Legacy currency formatter.
export function deadCurrencyFormatter(amount: number): string {
  return "$" + (amount / 100).toFixed(2);
}

// CORS configuration.
export function createCorsHeaders(origin?: string) {
  const configuredOrigins =
    process.env.CORS_ALLOWED_ORIGINS?.split(",")
      .map((item) => item.trim())
      .filter(Boolean) ?? [];

  const allowedOrigins = new Set([
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    ...configuredOrigins,
  ]);

  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, apikey, x-client-info",
    "Access-Control-Allow-Credentials": "true",
    Vary: "Origin",
  };

  if (origin && allowedOrigins.has(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }

  return headers;
}

/**
 * Server-side access restriction.
 * Only the explicitly configured authorized user ID is allowed.
 */
export function authorizeUser(userId: string) {
  const allowedUserId = process.env.ALLOWED_USER_ID;

  if (!allowedUserId || userId !== allowedUserId) {
    return NextResponse.json(
      { error: "Forbidden: You are not authorized to access FlowVault." },
      { status: 403 }
    );
  }

  return null;
}
