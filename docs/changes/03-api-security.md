# Challenge 3: Secure API Endpoints

## Problem Statement

The backend API had no real authentication or authorization. The `authMiddleware` in `apps/backend/src/auth.ts` was a placeholder that called `next()` unconditionally — every route was publicly accessible. Anyone could read, create, or modify any sponsor's campaigns or publisher's ad slots without logging in.

### What Was Broken

1. **No session validation** — the middleware never checked cookies or tokens
2. **No ownership scoping** — queries returned all records regardless of who was asking
3. **No role-based access control** — sponsors could access publisher routes and vice versa
4. **Frontend didn't send credentials** — the API client (`lib/api.ts`) omitted cookies from requests
5. **No `/api/auth/me` endpoint** — the frontend had no way to verify the authenticated user's identity from the backend
6. **CORS wasn't configured for credentials** — even if cookies were sent, the browser would reject the response

## Approach: Better Auth Session Validation (Option A)

### Alternatives Considered

| Option | Approach | Trade-offs |
|---|---|---|
| **A: Better Auth `getSession()`** | Use Better Auth's built-in API to validate the session cookie | Consistent with frontend auth, single source of truth, maintained by library |
| **B: Direct DB query** | Query the `session` table directly with Prisma | Full control, no extra dependency, but duplicates Better Auth's validation logic |

**Chose Option A** because:
- The frontend already uses Better Auth for session management
- `auth.api.getSession()` handles cookie parsing, expiry checks, and session rotation automatically
- Avoids duplicating validation logic that could drift from Better Auth's implementation
- Keeps the backend and frontend using the same session verification path

### Why Not JWT / Token-Based Auth?

The project already uses Better Auth with cookie-based sessions. Switching to JWTs would require:
- A separate token issuance endpoint
- Token refresh logic
- Changes to the frontend auth flow

Cookie-based sessions are simpler for same-origin and proxied deployments, and Better Auth handles session lifecycle out of the box.

## Changes Made

### 1. Backend Better Auth Instance (`apps/backend/src/lib/auth.ts`) — NEW FILE

Created a Better Auth instance on the backend that shares the same database and secret as the frontend. This allows the backend to validate session cookies that were issued by the frontend's auth flow.

Key configuration:
- Uses the same `DATABASE_URL` and `BETTER_AUTH_SECRET` as the frontend (via shared `.env`)
- `baseURL` points to the frontend origin so cookies are validated against the correct domain
- `emailAndPassword: { enabled: true }` matches the frontend's auth configuration

### 2. Auth Middleware Rewrite (`apps/backend/src/auth.ts`)

Replaced the no-op middleware with real session validation:

**Flow:**
1. Convert Express `req.headers` to a Web `Headers` object (Better Auth expects Web API headers)
2. Call `auth.api.getSession({ headers })` to validate the session cookie
3. If no session → 401 Unauthorized
4. Look up the user in both `Sponsor` and `Publisher` tables to determine their role
5. Attach `req.user` with `id`, `email`, `role`, `sponsorId`/`publisherId`
6. If user has no role (exists in auth but not in sponsor/publisher tables) → 403 Forbidden

**`AuthRequest` interface** extends Express `Request` with a typed `user` object that downstream route handlers can use without additional DB lookups.

### 3. Route Protection (`apps/backend/src/routes/index.ts`)

Applied `authMiddleware` selectively:

| Route | Protected? | Reason |
|---|---|---|
| `/api/auth/*` | No | Login/signup must be accessible to unauthenticated users |
| `/api/sponsors` | No | Public directory listing (marketplace browsing) |
| `/api/publishers` | No | Public directory listing (marketplace browsing) |
| `/api/health` | No | Infrastructure health check |
| `/api/campaigns/*` | **Yes** | Contains sensitive campaign data (budgets, targeting) |
| `/api/ad-slots/*` | **Yes** | Contains publisher inventory and pricing |
| `/api/placements/*` | **Yes** | Contains booking/contract data |
| `/api/dashboard/*` | **Yes** | Contains aggregate business metrics |

### 4. Campaigns Route — Ownership Scoping + Role Guards (`apps/backend/src/routes/campaigns.ts`)

Every handler now:
- **Checks role**: Returns 403 if the user is not a SPONSOR
- **Scopes queries**: Uses `req.user!.sponsorId` to filter — only returns/creates/modifies the authenticated sponsor's campaigns
- **Prevents Prisma's `undefined` bypass**: Without the role check, `sponsorId: undefined` (for a publisher user) causes Prisma to ignore the filter and return ALL records — a critical data leak

**Before:** `GET /api/campaigns` → returns all campaigns in the database
**After:** `GET /api/campaigns` → returns only the authenticated sponsor's campaigns, or 403 for publishers

### 5. Ad Slots Route — Ownership Scoping + Role Guards (`apps/backend/src/routes/adSlots.ts`)

Same pattern as campaigns:
- GET/POST ad slots: 403 if not a PUBLISHER
- Book endpoint: 403 if not a SPONSOR (booking is a sponsor action)
- Unbook endpoint: 403 if not a PUBLISHER + ownership check via `findFirst` with `publisherId`

### 6. `/api/auth/me` Endpoint (`apps/backend/src/routes/auth.ts`)

New `GET /api/auth/me` endpoint that returns the authenticated user's:
- `id`, `email`, `name` (from Better Auth session)
- `role` (sponsor/publisher, looked up from DB)
- `sponsorId`/`publisherId` and entity name

This gives the frontend a backend-validated way to check the current user's identity and role, separate from Better Auth's client-side session.

### 7. CORS Configuration (`apps/backend/src/index.ts`)

Updated CORS to:
- `credentials: true` — allows the browser to send/receive cookies cross-origin
- `origin: process.env.BETTER_AUTH_URL || 'http://localhost:3847'` — restricts to the frontend origin (not wildcard `*`, which is incompatible with credentials)

### 8. Frontend API Client (`apps/frontend/lib/api.ts`)

- Added `credentials: 'include'` to the base `api()` function — ensures client-side fetches send session cookies
- Updated all API functions (`getCampaigns`, `getAdSlots`, etc.) to accept an optional `RequestInit` parameter — allows server components to pass custom headers

### 9. Server-Side Cookie Forwarding (`apps/frontend/app/dashboard/sponsor/page.tsx`)

The sponsor dashboard's server component now forwards the incoming session cookie to the backend:

```typescript
const cookieStore = await cookies();
const cookieHeader = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join('; ');
campaigns = await getCampaigns(roleData.sponsorId, {
  headers: { Cookie: cookieHeader },
});
```

**Why this is necessary:** In Server Components, `credentials: 'include'` doesn't automatically forward the browser's cookies. The server-side `fetch()` runs in Node.js, not the browser — it has no implicit cookie jar. We must explicitly read cookies from the incoming request (via Next.js `cookies()`) and pass them as a `Cookie` header to the backend.

## Verification Results

| Test | Expected | Actual |
|---|---|---|
| `curl /api/campaigns` (no cookie) | 401 | 401 `{"error":"Not authenticated"}` |
| `curl /api/ad-slots` (no cookie) | 401 | 401 `{"error":"Not authenticated"}` |
| `curl /api/health` (no cookie) | 200 | 200 `{"status":"ok"}` |
| Login as sponsor → dashboard | See own campaigns | "Q1 Product Launch" shown (Acme Corp's only campaign) |
| Sponsor accessing other sponsor's campaign by ID | 404 | 404 `{"error":"Campaign not found"}` |
| Publisher accessing `/api/campaigns` | 403 | 403 `{"error":"Only sponsors can access campaigns"}` |
| Login as publisher → dashboard | See own ad slots | 4 ad slots shown (Dev Blog Daily's slots) |
| `/api/auth/me` (authenticated) | User info with role | Returns id, email, role, sponsorId/publisherId |
| `pnpm typecheck` | Clean | Zero errors on both backend and frontend |

## Trade-offs and Considerations

### Prisma's `undefined` Filter Behavior

**Critical discovery:** Prisma silently ignores `where` conditions set to `undefined`. If `sponsorId` is `undefined` (because a publisher accessed the campaigns endpoint), `{ where: { sponsorId: undefined } }` is equivalent to `{ where: {} }` — returning ALL records.

**Mitigation:** Explicit role guards at the top of each handler that return 403 before the Prisma query runs. This is defense-in-depth: even if the role guard were accidentally removed, the scoping filter would still limit results (though to "all" for the wrong role, which is why both layers matter).

### Session Validation on Every Request

Each protected request triggers a `getSession()` call that hits the database. For high-traffic endpoints, this adds latency.

**Acceptable because:**
- Better Auth caches session lookups internally
- The middleware also queries `Sponsor`/`Publisher` tables — could be optimized with Redis caching if needed
- Session-based auth is inherently stateful; this is the expected trade-off vs. stateless JWTs

### Server-Side Cookie Forwarding Complexity

Forwarding cookies in Server Components adds boilerplate. Every server-side API call to a protected endpoint needs the cookie header.

**Alternatives considered:**
- Creating a `serverApi()` wrapper that auto-forwards cookies — would reduce boilerplate but adds indirection
- Using a shared session store accessible to both frontend and backend without HTTP — would require architectural changes

**Current approach is explicit and debuggable**, which is appropriate for a take-home demonstrating understanding of the auth flow.

## Files Changed

| File | Change |
|---|---|
| `apps/backend/src/lib/auth.ts` | **NEW** — Better Auth backend instance |
| `apps/backend/src/auth.ts` | Rewrote from no-op to session validation + role lookup |
| `apps/backend/src/routes/index.ts` | Applied `authMiddleware` to protected route groups |
| `apps/backend/src/routes/campaigns.ts` | Added role guards + ownership scoping |
| `apps/backend/src/routes/adSlots.ts` | Added role guards + ownership scoping |
| `apps/backend/src/routes/auth.ts` | Implemented `GET /api/auth/me` |
| `apps/backend/src/index.ts` | CORS with `credentials: true` + explicit origin |
| `apps/frontend/lib/api.ts` | Added `credentials: 'include'` + options passthrough |
| `apps/frontend/app/dashboard/sponsor/page.tsx` | Forward cookies for server-side API calls |
| `apps/backend/package.json` | Added `@types/pg` devDependency |
