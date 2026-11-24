# Task 02: Dependency Audit and Supply Chain Review

## Executive Summary
This document provides a security audit of all runtime and development dependencies declared in `package.json` for FlowVault. The audit identifies supply chain risks, including hallucinated/slopsquatted packages, obsolete micro-utilities with wildcard version specifiers, and vulnerable framework versions subject to known CVEs (notably CVE-2025-29927).

---

## Dependency Review Table

| Package | Version | Risk / Verdict | Action |
|---|---|---|---|
| `@supabase/supabase-js` | `^2.49.1` | **Low / Safe** — Legitimate official Supabase JavaScript SDK for database and auth interaction. | **Keep** |
| `is-number` | `*` | **Medium / High** — Micro-utility anti-pattern; wildcard `"*"` version pinning allows unvetted upstream code to enter builds; redundant with native JS checks. | **Remove** |
| `is-odd` | `*` | **Medium / High** — Unnecessary micro-dependency pinned to wildcard `"*"` (transitive dep on `is-number`); redundant with `n % 2 !== 0`. | **Remove** |
| `left-pad` | `^1.3.0` | **Medium** — Deprecated and unmaintained legacy package (infamous 2016 single point of failure); native `String.prototype.padStart()` is standard. | **Remove** |
| `lucide-react` | `^1.16.0` | **Low / Safe** — Standard open-source icon library used for dashboard and landing page UI components. | **Keep** |
| `next` | `15.5.29` | **High** — The starter's `15.2.1` pin was outdated and included known middleware/RSC security issues. | **Pinned to the latest patched Next.js 15 maintenance release** |
| `next-auth-helpr` | `file:./local-stubs/next-auth-helpr` | **Critical** — Simulated typosquatting / AI-hallucinated package ("slopsquatting") targeting `next-auth` / `@auth/nextjs`. High risk of supply chain compromise. | **Remove dependency and delete local stub** |
| `react` | `^19.0.0` | **Low / Safe** — Core React framework runtime; official release matching Next.js 15. | **Keep** |
| `react-dom` | `^19.0.0` | **Low / Safe** — React DOM renderer. | **Keep** |
| `@types/node` | `^20.17.24` | **Low / Safe** — Standard TypeScript type definitions for Node.js runtime APIs. | **Keep** |
| `@types/react` | `^19.0.10` | **Low / Safe** — Standard TypeScript type definitions for React. | **Keep** |
| `@types/react-dom` | `^19.0.4` | **Low / Safe** — Standard TypeScript type definitions for React DOM. | **Keep** |
| `autoprefixer` | `^10.4.20` | **Low / Safe** — Standard PostCSS plugin for parsing CSS and adding vendor prefixes. | **Keep** |
| `postcss` | `^8.4.49` | **Low / Safe** — Standard CSS transformation tool for Tailwind CSS pipeline. | **Keep** |
| `tailwindcss` | `^3.4.17` | **Low / Safe** — Utility-first CSS framework for UI styling. | **Keep** |
| `typescript` | `^5.8.2` | **Low / Safe** — TypeScript compiler and static type analysis tool. | **Keep** |

---

## Detailed Findings & Risk Analysis

### 1. Hallucinated / Slopsquatted Package: `next-auth-helpr`
- **Root Cause**: The repository defined `"next-auth-helpr": "file:./local-stubs/next-auth-helpr"`. This represents a classic AI hallucination or malicious typosquatting attack ("slopsquatting") simulating an attacker registering common misspellings or LLM-hallucinated variations of legitimate libraries like `next-auth` (`@auth/nextjs`).
- **Remediation**: Removed `next-auth-helpr` from `package.json`, deleted `local-stubs/next-auth-helpr`, and regenerated `package-lock.json`.

### 2. Micro-Dependencies & Wildcard Pinning: `is-number`, `is-odd`, `left-pad`
- **Root Cause**: 
  - `is-number` and `is-odd` were pinned to `"*"`, leaving builds vulnerable to unvetted upstream releases, dependency confusion, or compromised publisher credentials.
  - `left-pad` has been unmaintained for years and introduces unnecessary dependency tree bloat.
  - Modern JavaScript natively supports all functionality provided by these packages (`typeof n === 'number'`, `n % 2 !== 0`, and `String.prototype.padStart()`).
- **Remediation**: Purged all three packages from `package.json`.

### 3. Framework Vulnerability: `next@15.2.1` (CVE-2025-29927)
- **Root Cause**: Next.js 15.2.1 contains an authorization bypass vulnerability (CVE-2025-29927). An attacker can supply the internal header `x-middleware-subrequest: 1` to bypass middleware evaluation and reach downstream route handlers directly.
- **Remediation**: Upgraded `next` to `15.5.29`, a patched Next.js 15 maintenance release, and regenerated the npm lockfile. Route handlers also enforce authentication and authorization directly, so middleware is only a navigation hint.

---

## Conclusion & Hardening Actions
1. `next-auth-helpr`, `is-number`, `is-odd`, and `left-pad` removed.
2. `local-stubs/next-auth-helpr` directory deleted.
3. `next` upgraded to `15.5.29`.
4. `package-lock.json` regenerated to match the manifest and remove the hallucinated local package.
