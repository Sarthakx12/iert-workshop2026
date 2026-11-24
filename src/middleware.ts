import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Middleware is a navigation hint only. API routes enforce identity and role themselves.
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    const sessionToken = request.cookies.get("flowvault_session")?.value;

    if (!sessionToken) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Unauthorized: Missing session" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/login?error=unauthorized", request.url));
    }

  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
