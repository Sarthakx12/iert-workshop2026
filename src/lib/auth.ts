import { db, type User } from "@/lib/db";

function getCookieValue(header: string | null, name: string): string | undefined {
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const [key, ...value] = part.trim().split("=");
    if (key === name) {
      try {
        return decodeURIComponent(value.join("="));
      } catch {
        return undefined;
      }
    }
  }
  return undefined;
}

export function getRequestUser(request: Request): User | undefined {
  const authorization = request.headers.get("authorization");
  const token = getCookieValue(request.headers.get("cookie"), "flowvault_session") ??
    (authorization?.startsWith("Bearer ") ? authorization.slice(7) : undefined);
  return token ? db.getUserBySession(token) : undefined;
}

export function isAdmin(user: User | undefined): user is User {
  return user?.role === "admin";
}
