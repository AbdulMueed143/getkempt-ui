# Security Plan — Get Kempt

> Living document. Update it whenever a new dependency, feature or
> deployment surface is introduced.

This document describes how we keep the **Get Kempt** platform secure across
its frontend, future backend, and infrastructure. It is written for both the
team _today_ (frontend-only, mock data) and _tomorrow_ (real backend, JWT auth,
payments, customer PII).

---

## 1 · Threat Model (who are we defending against, and what?)

| Asset | Why an attacker wants it |
|---|---|
| Customer PII (name, phone, email, address) | Identity theft, spam, resale |
| Booking history / visit history | Stalking risk for end-users |
| Payment data (card, deposit, charges) | Direct financial fraud |
| Shop owner credentials / JWT | Take over a shop, manipulate revenue |
| Stripe Connect account / API keys | Drain merchant funds |
| Marketing / SMS quota | Send spam at our cost |

| Adversary | Capabilities |
|---|---|
| Opportunistic web scanner | Mass-scan exposed endpoints, default creds, known CVEs |
| Account-takeover attacker | Credential stuffing, password reset abuse, token theft |
| Malicious staff member | Privilege escalation against their own shop |
| Supply-chain attacker | Malicious npm package, compromised CI |
| Insider / cloud breach | Reads .env, S3 buckets, backups |

We are **not** trying to defend against nation-state level adversaries.
We **are** trying to defend against everything in the OWASP Top 10.

---

## 2 · OWASP Top 10 — Application Security Checklist

For each category we list: _what it is_ → _how we handle it today_ →
_what we must add when the backend lands_.

### A01 — Broken Access Control
- Every API call **must** be authorized server-side. Never trust the JWT alone — verify the `sub` belongs to the resource being touched.
- Use **server-side role checks** (`Owner`, `Admin`, `Staff`, `Client`). The frontend may _hide_ buttons but never _grant_ access.
- Resource-scoping: a staff member must only ever see appointments / clients in their own shop. Enforce with a `shopId` filter in every query.
- Disable `GET /api/staff/:id` from leaking other shops' staff.
- IDOR test: every endpoint accepting an `:id` must be tested with another tenant's id.

### A02 — Cryptographic Failures
- TLS 1.2+ only, HSTS preload (already in `docker/default.conf`).
- Never log JWTs, passwords, or full credit card data.
- Use `bcrypt` (cost ≥ 12) or `argon2id` for password storage on the backend.
- Use `crypto.randomUUID()` / `crypto.getRandomValues()` for tokens — never `Math.random()`.
- Stripe handles card data — we never see PANs.

### A03 — Injection
- **SQL/ORM**: use parameterized queries / ORM bindings only; no string concatenation.
- **NoSQL**: validate object shapes with `zod` before passing to MongoDB / similar.
- **Command injection**: never pass user input to `exec` / `child_process`.
- **HTML/XSS**: React auto-escapes `{value}`. Avoid `dangerouslySetInnerHTML`. If unavoidable, sanitize with DOMPurify.
- **CSP** (already shipped in `docker/default.conf`) blocks inline-script execution from non-`self` origins.

### A04 — Insecure Design
- Threat-model every new feature before coding (this doc + a short paragraph in the PR).
- Apply the **principle of least privilege** to JWT scopes (`shop:read`, `bookings:write`, etc.) once we add roles.
- All payment & cancellation logic runs on the **backend** with the canonical numbers — never trust frontend totals.

### A05 — Security Misconfiguration
- Production builds **never** include source maps for proprietary code (`productionBrowserSourceMaps: false`, currently the default).
- `next.config.ts` has no `serverActions.allowedOrigins: ["*"]` or similar wildcards.
- Docker image runs as non-root, read-only FS, no extra capabilities (already in `docker-compose.yml`).
- No default credentials anywhere. Force a password change on first login.
- Disable directory listing (nginx default; we override `try_files`).

### A06 — Vulnerable & Outdated Components
- `npm audit --omit=dev` runs in CI on every PR; fail on **High/Critical**.
- Dependabot (or Renovate) opens weekly PRs to bump dependencies.
- Pin major versions in `package.json`; rely on `package-lock.json` for reproducibility.
- Subscribe to GitHub security advisories for `next`, `react`, `recharts`, `zod`, `react-hook-form`, `zustand`.

### A07 — Identification & Authentication Failures
- See full **Section 4 — JWT & Auth** below.
- Rate-limit login + password-reset endpoints (5 attempts / 15 min / IP and / account).
- Enforce strong passwords (length ≥ 12, zxcvbn score ≥ 3).
- Email verification on signup. SMS / authenticator-app 2FA for shop owners (post-MVP).

### A08 — Software & Data Integrity Failures
- Lockfile-only installs in CI: `npm ci`, never `npm install`.
- Sign Docker images with cosign (post-MVP).
- Verify webhooks (Stripe `Stripe-Signature`, Twilio `X-Twilio-Signature`) before processing.

### A09 — Security Logging & Monitoring Failures
- Structured JSON logs on the backend (pino / winston). Include `requestId`, `userId`, `shopId`, `route`, `status`, `latency`.
- Forward logs to a SIEM (Datadog / Grafana Cloud / OpenSearch).
- Alert on:
  - 5+ failed logins / minute / IP
  - 3+ password resets / 10 min / account
  - 5xx spike > 1% of traffic
  - Any 403 from a `Client` role hitting an `Owner`-only route

### A10 — Server-Side Request Forgery (SSRF)
- If we ever fetch URLs from user input (avatar URLs, webhooks…) — block private IP ranges (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 127.0.0.0/8, 169.254.0.0/16, ::1/128).
- Use an allowlist of HTTPS-only domains for webhooks.

---

## 3 · Frontend-specific Hardening (this repo, today)

The frontend is a **statically exported Next.js app**. It has no server runtime, which already eliminates a huge class of vulnerabilities (no SSR injection, no Node deserialization, no API routes in the same image).

What still applies:

- **No secrets in `NEXT_PUBLIC_*` vars.** Anything prefixed `NEXT_PUBLIC_` is bundled into JS and shipped to the browser. Only put **publishable** keys here (Stripe publishable key, Google Maps API key restricted by HTTP referrer).
- **Restrict the Google Maps API key** to HTTP referrer = your production domain in the Google Cloud Console.
- **Restrict the Stripe publishable key** — it's safe to ship, but rotate if leaked.
- **Avoid `dangerouslySetInnerHTML`.** Today the codebase has zero usages. Keep it that way.
- **Validate every form with zod** — already enforced by `react-hook-form` + `@hookform/resolvers`.
- **Local storage is a public space.** Do not put JWTs in `localStorage` (XSS-stealable). Use `httpOnly; Secure; SameSite=Lax` cookies set by the backend.
- **CSP is shipped** by the docker image — tighten `script-src` (drop `'unsafe-inline'`/`'unsafe-eval'`) once you migrate away from inline-style libraries that need them.
- **Do not log full client objects** to the console in production. They contain PII.

---

## 4 · JWT & Auth — Implementation Guide for the Backend

When you build the backend (Node/Express/Nest, Go, or Rails), use this as the
auth contract. The frontend already calls a `signIn(email, password)` mock —
this section tells you how to make it real **and** safe.

### 4.1 — Token strategy

| | Access token | Refresh token |
|---|---|---|
| Lifetime | **15 min** | **7–14 days** |
| Storage | `httpOnly; Secure; SameSite=Strict` cookie | `httpOnly; Secure; SameSite=Strict; Path=/auth/refresh` cookie |
| Revocable? | No (short TTL) | **Yes** — keep a `tokenId` allowlist in Redis |
| Algorithm | `RS256` (asymmetric) — private key on auth server only | Same |
| Claims | `sub`, `shopId`, `role`, `iat`, `exp`, `jti` | `sub`, `jti`, `iat`, `exp` |

Why **not** `localStorage` for tokens?
- Any XSS on the page can read it. With `httpOnly` cookies, the JS context cannot.

Why **not** `HS256`?
- Symmetric secret means anyone who can read it can _forge_ tokens. Use RS256 so leaks of the public key are harmless.

### 4.2 — Login flow

```
POST /auth/login { email, password }
  → bcrypt-compare password
  → on success: issue access + refresh
  → set both as httpOnly Secure SameSite=Strict cookies
  → return { user: { id, name, role, shopId } }    # never the token
```

### 4.3 — Refresh flow

```
POST /auth/refresh        (cookie auto-sent)
  → verify refresh token signature
  → check jti is in the Redis allowlist (rotation)
  → invalidate the old jti, issue a new pair (refresh-rotation)
  → return new cookies
```

### 4.4 — Logout

```
POST /auth/logout
  → remove the refresh jti from Redis
  → clear both cookies
```

### 4.5 — CSRF

Because tokens live in cookies, you **must** add CSRF protection:
- Easy mode: `SameSite=Strict` cookies + the API only accepts JSON `Content-Type: application/json` (browsers won't send simple-form CSRF then).
- Robust mode: double-submit CSRF token in `X-CSRF-Token` header + cookie, validated server-side.

### 4.6 — Password reset

- Token: 32 random bytes, base64url, single-use, **15-minute** expiry, stored hashed (sha256) in DB.
- Email link: `https://app.getkempt.co/reset-password?token=…`.
- After consumption, invalidate ALL existing sessions for that user.
- Rate-limit: 3 reset emails / hour / account.

### 4.7 — Multi-tenancy enforcement

Every authenticated request must:
1. Verify JWT signature.
2. Load the user's `shopId` from the token claim.
3. Scope every DB query with `WHERE shop_id = :shopId`.
4. Reject (`403`) any path-param or body field that references another `shopId`.

Test it: write integration tests that hit `/api/bookings/:id` with another tenant's id and expect `403`.

### 4.8 — Roles

| Role | Can |
|---|---|
| `Owner` | Everything within their own shop |
| `Manager` | Most things; cannot delete the shop, change billing, or change owner |
| `Staff` | Read all bookings, write own bookings, see own clients only |
| `Client` (mobile app users) | Read/write own bookings only |

Encode the role in the JWT and **also** check it server-side on every endpoint.

---

## 5 · Secrets Management

| Where it lives | What goes there |
|---|---|
| `.env.local` (gitignored) | Personal dev keys |
| `docker-compose.yml` env-vars | Local container builds |
| GitHub Actions secrets | CI/CD |
| Cloud secret manager (AWS Secrets Manager / GCP Secret Manager / Doppler) | **Production runtime** |
| **Never** | git, slack, jira tickets, screenshots |

Rules:
- `.env*` files are in `.gitignore` and `.dockerignore` (already done).
- Rotate every key on a known schedule (90 days) and **immediately** if exposed.
- Use one secret per environment — never share staging and prod secrets.
- The Stripe **publishable** key is safe to bundle; the **secret** key never leaves the backend.

---

## 6 · Dependency & Supply-Chain Hygiene

```bash
# Run in CI on every PR
npm audit --omit=dev --audit-level=high
npm outdated
```

- Add **Dependabot** (`.github/dependabot.yml`) for npm + GitHub Actions + Docker image bumps.
- Use **CodeQL** (`github/codeql-action`) for SAST on every push.
- Use **gitleaks** in CI to block accidental secret commits.
- Pin GitHub Actions by SHA, not tag (`uses: actions/checkout@8e5e7e5…` not `@v4`).

---

## 7 · CI / CD Hardening

When you wire up GitHub Actions:

- Workflows trigger only on `push` and `pull_request`. Never `pull_request_target` from forks (allows secret theft).
- Use `permissions: contents: read` at the workflow level. Add more only where needed.
- Cache by lockfile hash, not branch name.
- Lint, type-check, test, and `npm audit` must all pass before merging to `main`.
- Production deploys require **manual approval** + an environment with required reviewers.

---

## 8 · Logging, Monitoring & Incident Response

- **Logs** — structured JSON, never include passwords / JWTs / PANs / full client records. Include `requestId` for cross-service tracing.
- **Errors** — capture in Sentry (frontend + backend). Scrub PII in `beforeSend`.
- **Metrics** — uptime, p95 latency, error rate, login success rate, payment success rate.
- **Alerts** — Slack/email on:
  - 5+ failed logins / minute / IP
  - Stripe webhook signature mismatch
  - 5xx spike
  - New release fails healthcheck
- **Incident runbook** — see `INCIDENT_RUNBOOK.md` (TODO once we go live).
- **Disclosure** — publish `security@getkempt.co` and a `.well-known/security.txt`.

---

## 9 · Privacy & Data Protection (Australian Privacy Act + GDPR-friendly)

- Collect only what we need (phone for SMS reminders, address optional).
- Encrypt sensitive columns at rest (e.g. PostgreSQL pgcrypto, or column-level KMS).
- Soft-delete clients with a 30-day grace period; then **hard-delete + anonymise** booking history.
- Provide an **export-my-data** endpoint per client.
- Keep an audit log of who accessed which client record.
- Document our retention policy in a public Privacy Policy.

---

## 10 · Phased Security Roadmap

Tick these off as you build out the backend.

### Phase 0 — Today (frontend-only, mock data)
- [x] Static export served via hardened nginx
- [x] CSP, HSTS, X-Frame-Options, Permissions-Policy
- [x] No `NEXT_PUBLIC_*` secrets
- [x] `.gitignore` + `.dockerignore` exclude `.env*`
- [x] React auto-escaping, no `dangerouslySetInnerHTML`
- [x] zod-validated forms

### Phase 1 — Backend MVP (auth, bookings, payments)
- [ ] RS256 JWT with short access + rotating refresh in httpOnly cookies
- [ ] bcrypt/argon2 password hashing
- [ ] Multi-tenant query scoping with integration tests
- [ ] Rate-limiting (login, signup, reset) — `express-rate-limit` / `nestjs-throttler`
- [ ] CORS allowlist (no `*`)
- [ ] Stripe webhook signature verification
- [ ] Audit log for sensitive admin actions
- [ ] Helmet middleware (sets the HTTP security headers nginx already adds — defence in depth)

### Phase 2 — Production launch
- [ ] WAF in front of the app (Cloudflare / AWS WAF)
- [ ] Secrets in cloud secret manager (not env files)
- [ ] Sentry + structured logs in a SIEM
- [ ] Dependabot + CodeQL + gitleaks + Trivy in CI
- [ ] Backups: nightly PG dumps, encrypted, retention 30 days, tested restores monthly
- [ ] DR runbook
- [ ] First external **penetration test**
- [ ] Public `security.txt` + `security@getkempt.co`

### Phase 3 — Scale & compliance
- [ ] 2FA (TOTP via `otplib`) for owners and managers
- [ ] SOC 2 Lite — vendor inventory, access reviews, change management
- [ ] Quarterly access review (who has prod / DB / secret-manager access)
- [ ] Bug-bounty program (HackerOne / Intigriti)
- [ ] Cosign-signed container images, SBOM

---

## 11 · Reporting a Vulnerability

If you find a security issue, **do not open a public GitHub issue.**

Email **security@getkempt.co** with:

- A clear description of the issue
- Steps to reproduce
- Impact assessment
- Your contact info (so we can credit you)

We aim to acknowledge within **2 business days** and to patch high-severity
issues within **7 days**. Responsible disclosure earns a public credit in the
release notes.

---

## 12 · One-page Code Review Checklist

Before merging any PR touching auth, payments, or PII:

- [ ] No new `dangerouslySetInnerHTML`, `eval`, `Function(...)`.
- [ ] No new `NEXT_PUBLIC_*` containing a secret.
- [ ] All new endpoints check `req.user` + `req.user.shopId`.
- [ ] All user-controlled IDs are validated against the caller's tenant.
- [ ] All new forms have a zod schema; backend re-validates the same shape.
- [ ] No new dependency without checking its weekly downloads, last release, and `npm audit` status.
- [ ] No new `console.log` of PII / tokens / passwords.
- [ ] Tests cover the unhappy path (401, 403, malformed body, IDOR attempt).

---

_Last reviewed: 2026-04-25 · Owner: @abdulmueed_
