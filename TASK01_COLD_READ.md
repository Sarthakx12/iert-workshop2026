# Task 01: Cold Read — Ranked Top 10 Risks

Read-only review of the original starter snapshot, before the remediation changes in this branch; the application was not run. Ranking reflects likely impact and exploitability if that original code or its configured services were deployed. Line references below refer to the pre-remediation snapshot.

1. **Self-service privilege escalation:** authenticated users can mass-assign `role` through profile PATCH, then the middleware trusts the client-controlled role cookie — `src/app/api/profile/route.ts:43-56`; `src/middleware.ts:8-23`.
2. **Unauthenticated admin data disclosure:** the users API handler has no auth check and returns the directory; middleware checks only cookie presence/role and does not validate the session — `src/app/api/admin/users/route.ts:9-19`; `src/middleware.ts:8-24`.
3. **SSRF to internal services:** caller-controlled URLs are fetched with redirects followed and no scheme, host, or private-IP checks; the internal metrics route exposes configuration-like values — `src/app/api/import-url/route.ts:9-21`; `src/app/api/internal/metrics/route.ts:8-35`.
4. **Cross-tenant database exposure:** orders have RLS disabled, notes allow all operations, and the view omits `security_invoker`; impact depends on exposing the configured Supabase roles/API — `supabase/schema.sql:29-30,42-54`.
5. **Order IDOR/BOLA:** any authenticated user can retrieve an order by ID without checking its `user_id` — `src/app/api/orders/[id]/route.ts:24-42`.
6. **Cross-tenant note disclosure via AI path:** prompt patterns invoke a tool that reads every tenant's notes and returns their contents — `src/app/api/ai/assistant/route.ts:41-45,53-79`.
7. **Stored XSS:** comments are persisted as raw input and rendered with `dangerouslySetInnerHTML`, enabling script injection for viewers — `src/app/api/comments/route.ts:14-26`; `src/app/dashboard/page.tsx:345-348`.
8. **Session theft and forged admin role:** login exposes the session token in the response/logs and sets session/role cookies without `HttpOnly`; middleware trusts the role cookie — `src/app/api/auth/login/route.ts:20-55`; `src/middleware.ts:8-24`.
9. **Coupon limit bypass:** the use limit is checked before an artificial async delay, then redeemed through a non-atomic mutation — `src/app/api/coupons/redeem/route.ts:28-45`; `src/lib/db.ts:292-306`.
10. **Supply-chain integrity risk:** wildcard dependency ranges and an unusual local auth-helper package make dependency intent and provenance harder to verify; Next.js is pinned to `15.2.1` — `package.json:13-22`.

**Secret note:** `DebugFooter` references a `NEXT_PUBLIC_` service-role variable and displays it in the browser, but the checked-in `.env.example` value is explicitly a fake workshop placeholder. Treat this as a deployment/configuration hazard; this cold read did not verify a live credential — `src/components/DebugFooter.tsx:8-11,31-38`; `.env.example:5`.
