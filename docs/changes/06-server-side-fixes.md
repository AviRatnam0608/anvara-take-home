# Challenge 6: Server-Side Auth & Data Fetching Fixes

## What Was Wrong

Three component trees were doing authentication and data fetching entirely on the client side, using `'use client'` with `useEffect` and `authClient`. This is a common anti-pattern in Next.js that defeats the purpose of server-side rendering.

### 1. Navigation (`app/components/nav.tsx`)

**Anti-pattern:** Used `authClient.useSession()` to check auth state, then fired a `useEffect` to fetch the user's role from `/api/auth/role/{userId}`.

**Issues:**
- The user ID was visible in the browser's Network tab — anyone inspecting traffic could see it
- Flash of unauthenticated UI on every page load (nav renders without user info, then re-renders after the client-side session check completes)
- Two sequential client-side requests (session → role) before the nav could render correctly

### 2. Marketplace List (`app/marketplace/components/ad-slot-grid.tsx`)

**Anti-pattern:** The grid component was marked `'use client'` and fetched ad slots in a `useEffect` via the client-side `getAdSlots()` API helper.

**Issues:**
- Request waterfall: browser downloads HTML → downloads JS bundle → executes → fires API call → renders data
- No server-side rendering — search engines and initial page loads see an empty grid with a "Loading..." spinner
- The marketplace page itself (`page.tsx`) was a pure wrapper that just rendered the client component

### 3. Marketplace Detail (`app/marketplace/[id]/components/ad-slot-detail.tsx`)

**Anti-pattern:** This was the worst offender — a 297-line `'use client'` component with a triple `useEffect` waterfall:
1. Fetch the ad slot data via `getAdSlot(id)`
2. Simultaneously call `authClient.getSession()` to get the user
3. If user exists, fetch their role from `/api/auth/role/{userId}`
4. For booking, use an inline `fetch()` with the `sponsorId` pulled from client-side state

**Issues:**
- Three sequential network requests before the page could fully render
- The `sponsorId` was sourced from client state — a malicious user could spoof it by modifying the request in DevTools
- Auth tokens and user IDs exposed in browser network traffic
- Booking action used raw `fetch()` without server-side cookie forwarding

## What Could This Lead To

1. **Security risk:** Client-side auth exposes user IDs, session tokens, and role information in the browser. A spoofed `sponsorId` in the booking flow could let someone book on behalf of another sponsor.

2. **Poor UX:** Multiple loading spinners and content flashing as each `useEffect` resolves sequentially. Users see empty states before data appears.

3. **SEO impact:** Client-rendered pages aren't indexed properly by search engines. The marketplace — arguably the most important public-facing page — was invisible to crawlers.

4. **Performance:** Request waterfalls (HTML → JS → API → render) add 200-500ms+ of latency compared to a single server-rendered response.

5. **Broken `revalidatePath`:** Next.js cache revalidation only works with server-side data fetching. Client-side `useEffect` fetches bypass the Next.js cache entirely, so `revalidatePath()` calls in Server Actions (like after booking) would have no effect.

## How It Was Fixed

### Pattern Applied

All three components were converted to follow the same server-side pattern already established in the dashboard pages:

```
Server Component (async):
  auth.api.getSession({ headers: await headers() })  →  server-side auth
  getUserRole(session.user.id)                        →  server-side role check
  serverApi<T>('/api/endpoint')                       →  server-side data fetch
  <ClientComponent data={data} />                     →  pass data as props
```

Only genuinely interactive elements (forms with `useActionState`, buttons with `onClick`) remain as `'use client'` components.

### Nav Fix

- **Before:** `'use client'` + `authClient.useSession()` + `useEffect` role fetch
- **After:** Async server component using `auth.api.getSession()` and `getUserRole()` directly
- **New file:** `logout-button.tsx` — tiny `'use client'` component (only interactive part)
- **Result:** Nav renders with correct user info on first paint, no flash

### Marketplace List Fix

- **Before:** `'use client'` + `useEffect` + `getAdSlots()` client fetch
- **After:** `page.tsx` fetches via `serverApi<AdSlot[]>('/api/ad-slots')`, passes data as props to a pure presentational `AdSlotGrid`
- **Result:** Ad slots are server-rendered in the initial HTML response

### Marketplace Detail Fix

- **Before:** 297-line `'use client'` component with triple waterfall + inline booking fetch
- **After:** Decomposed into:
  - `page.tsx` — async server component that fetches ad slot, session, and role server-side
  - `actions.ts` — `bookAdSlotAction` and `unbookAdSlotAction` Server Actions using `serverApi`
  - `booking-form.tsx` — `'use client'` form with `useActionState` (receives `sponsorName` as prop from server)
  - `unbook-button.tsx` — `'use client'` form for resetting bookings
- **Deleted:** `ad-slot-detail.tsx` (fully replaced)
- **Result:** Single server request renders the full page. Booking uses Server Actions with cookie-forwarded auth (sponsorId is never exposed to the client).

## Trade-offs and Alternatives

### Why Server Components over Route Handlers + SWR/React Query?

Server Components eliminate the client-server waterfall entirely. With SWR or React Query, you'd still need to:
- Ship the fetching library to the client bundle
- Handle loading/error states manually
- Deal with cache invalidation across tabs
- Expose API endpoints in the browser

Server Components move all of this to the server, resulting in smaller bundles and faster initial renders.

### Why Server Actions over API Routes for Mutations?

Server Actions (`'use server'`) provide:
- Automatic CSRF protection (built into Next.js)
- Cookie forwarding via `serverApi` without exposing tokens
- Integration with `revalidatePath` for cache invalidation
- Progressive enhancement — forms work without JavaScript

The trade-off is that Server Actions are tightly coupled to Next.js. If the frontend needed to be framework-agnostic, API routes with `fetch` would be more portable.

### Why Not Keep a Thin Client Wrapper?

An alternative was to keep `'use client'` components but use `useSWR` with `fallbackData` from server props. This would give real-time updates without full page reloads. We chose full server components because:
- The marketplace data doesn't change frequently enough to need real-time polling
- `revalidatePath` after Server Actions handles the mutation → re-fetch cycle
- Simpler architecture with fewer moving parts

### Remaining Client Components

The following components are intentionally `'use client'` because they require browser APIs or interactive state:
- `LogoutButton` — needs `authClient.signOut()` + `window.location.href`
- `BookingForm` — needs `useActionState` for form state + `textarea` controlled input
- `UnbookButton` — needs `useActionState` for pending state
- `SubmitButton` — needs `useFormStatus` for pending indicator
