# FlowVault

FlowVault is a local application-security workshop app. Its sample accounts and records are simulated; use it only on a machine and data you control. The current starter includes server-side authorization, per-user data checks, secure session cookies, and input/output safeguards so the exercise can be reviewed as a hardened baseline.

## Run locally

Requirements: Node.js 20 or later and npm.

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The app uses its local JSON database by default and does not need Supabase credentials.

URL import is disabled until an operator configures an exact host allowlist in `.env.local`:

```dotenv
URL_IMPORT_ALLOWED_HOSTS=downloads.example.com,docs.example.org
```

Only HTTPS on port 443 is accepted. Hosts must resolve to public addresses; the importer pins the vetted address, caps responses at 1 MB, times out requests, and rejects redirects. Leave the setting empty to keep URL import disabled.

## Sample accounts

| Account | Email | Password | Role |
|---|---|---|---|
| User A | `usera@example.com` | `Password123!` | User |
| User B | `userb@example.com` | `Password123!` | User |
| Admin | `admin@example.com` | `Admin123!` | Admin |

These are public workshop-only credentials. Do not use them or any real personal information outside the local demo. Passwords are stored as scrypt hashes in the local database; old local records are upgraded to hashes on load.

## Security controls in this baseline

- API routes authenticate from the session cookie and check ownership or admin role inside the handler.
- Profile updates accept only a bounded display name; the role and credit fields cannot be mass-assigned.
- Session tokens are random, `HttpOnly`, time-limited, and removed on sign-out. Authentication secrets are not returned to client JavaScript or written to logs.
- Orders, notes, comments, uploads, URL imports, and the local assistant have input and access checks. Comments render as text; the assistant only reads notes belonging to the signed-in user.
- File uploads require authentication, accept PNG/JPEG/PDF signatures only, are limited to 5 MB, use generated filenames, and stay outside the web root.
- Supabase tables use owner-scoped RLS; the order summary view runs with invoker permissions.
- Same-origin API requests are expected. No wildcard credentialed CORS policy is enabled. Security response headers include CSP, frame protection, MIME sniffing protection, and referrer policy.
- Unused and wildcard dependencies were removed; Next.js is pinned to a patched 15.x maintenance release in both manifests.

## Workshop references

- `TASK01_COLD_READ.md` records the ranked findings from the original starter snapshot; its line references refer to that pre-remediation code.
- `FLAWS_MAP.md` and `instructor-solutions/` preserve the workshop's instructor reference materials.
- `scripts/break/` contains historical proof-of-concept requests for the original vulnerable baseline. Run them only against your local demo; the security-related requests should now be rejected or limited to the current user's data.
- `scripts/setup-git-history.sh` creates a teaching history containing fake example secrets. Use only in a disposable copy and never push that history to a real project.

## Configuration notes

`.env.example` contains placeholders only. Copy it to `.env.local` for local overrides; `.env.local` and other environment files are ignored by Git. Never put a Supabase service-role key in a `NEXT_PUBLIC_` variable or client component. The database adapter in this workshop is a local file-backed demo and is not intended for production use or multi-process deployment.
