# Task 01: Cold Read — Top 10 Ranked Risks

1. Client-Exposed Service-Role Key: NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY bundled in client UI — src/components/DebugFooter.tsx:9 (.env.example:5)
2. Missing Auth on Admin API & Bypassable Middleware: /api/admin/users has no handler auth, relying only on middleware (CVE-2025-29927 on Next.js 15.2.1 & forgeable role cookie) — src/app/api/admin/users/route.ts:9-12 (src/middleware.ts:8-24)
3. Disabled / Broken RLS: RLS disabled on orders, USING(true) on notes, view lacks security_invoker — supabase/schema.sql:30 (45-48, 52-54)
4. Broken Access Control (IDOR) on Orders: No check that order.user_id === currentUser.id — src/app/api/orders/[id]/route.ts:30-37
5. Server-Side Request Forgery (SSRF): Arbitrary URL fetch with redirect follow and no allowlist — src/app/api/import-url/route.ts:14-21
6. AI Prompt Injection & Over-Permissioned Tool: User input concatenated into system prompt, exposing toolReadAllNotes() — src/app/api/ai/assistant/route.ts:33-37 (64-66)
7. Coupon Redemption Race Condition (TOCTOU): Non-atomic check-then-act across async delay — src/app/api/coupons/redeem/route.ts:29-45
8. Insecure Cookies, Plaintext Passwords & Token Logging: Plaintext password check, httpOnly: false cookies, raw session tokens logged — src/app/api/auth/login/route.ts:41-55 (13, 23)
9. Supply Chain / Slopsquatting & Vulnerable Framework: Hallucinated package next-auth-helpr, wildcard '*' deps, Next.js 15.2.1 — package.json:19-20 (15-16)
10. Stored XSS / Unsanitized Input: Raw comment bodies stored without sanitization/escaping — src/app/api/comments/route.ts:24
