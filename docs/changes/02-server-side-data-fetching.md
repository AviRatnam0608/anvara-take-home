# Challenge 2: Server-Side Data Fetching

## Problem: Client-Side Data Fetching in Sponsor Dashboard

**What was happening:**

`campaign-list.tsx` was a `'use client'` component that fetched campaign data entirely in the browser:

```
Browser loads page → JS bundle downloads → React hydrates
  → useSession() resolves → fetch(/api/auth/role/:id)
  → fetch(/api/campaigns?sponsorId=...) → campaigns render
```

This caused several issues:

1. **Network waterfall** — 4 sequential round trips before the user sees any campaign data. The page shell loads empty, then JavaScript runs, then session is checked, then role is fetched, then campaigns are fetched.
2. **Exposed API structure** — `NEXT_PUBLIC_API_URL` (`http://localhost:4291`) was baked into the client JavaScript bundle. Anyone inspecting the page source or Network tab could see the backend URL and endpoint structure.
3. **Unnecessary client bundle** — `useEffect`, `useState`, `authClient.useSession()`, and the `getCampaigns` API client all shipped as JavaScript to the browser. None of this code needs to run client-side.
4. **No server caching** — Every page visit triggered fresh client-side fetches. Server-side fetches can leverage Next.js request deduplication and caching.
5. **`any[]` type** — Campaigns were typed as `any[]`, losing all type safety.

**The key insight:** The parent `page.tsx` was already an `async` Server Component that had the session and `roleData` (including `sponsorId`). It did all auth and role checking on the server, then rendered `<CampaignList />` with zero props — forcing the child to re-derive everything on the client.

## Solution

Moved the data fetch into the Server Component that already had all the context, and converted the child components to presentational Server Components.

**1. `page.tsx` — Fetch campaigns server-side**

After the existing role check (which already has `roleData.sponsorId`), added:

```typescript
let campaigns: Campaign[] = [];
let error: string | null = null;

try {
  campaigns = await getCampaigns(roleData.sponsorId);
} catch {
  error = 'Failed to load campaigns';
}
```

Error state is rendered inline in the page. Campaigns are passed as props: `<CampaignList campaigns={campaigns} />`.

**2. `campaign-list.tsx` — Stripped to presentational component**

Removed:
- `'use client'` directive
- `useEffect`, `useState`, `authClient.useSession()` imports and usage
- `API_URL` constant
- Loading state (server renders the final HTML — there's no client-side loading phase)
- Error state (moved to parent)

The component now accepts `campaigns: Campaign[]` as a prop and renders the grid or empty state. It went from 70 lines to 28 lines.

**3. `campaign-card.tsx` — Removed unnecessary `'use client'`**

This component had `'use client'` but used no hooks, no event handlers, and no browser APIs. It's purely presentational (takes props, renders JSX), so it can be a Server Component. Removed the directive.

## New request flow

```
Browser requests page → Next.js server runs page.tsx:
  1. getSession() (server-side, reads cookies directly)
  2. getUserRole() (server-to-backend, not exposed to browser)
  3. getCampaigns() (server-to-backend, not exposed to browser)
  → HTML with campaign data is sent to browser in one response
```

One round trip instead of four. No JavaScript shipped for data fetching.

## Alternatives Considered

**React Server Components with Suspense boundary:**
Instead of fetching in `page.tsx` and passing props, we could have made `CampaignList` itself an async Server Component that fetches its own data, wrapped in `<Suspense fallback={<Loading />}>`. This would keep data fetching co-located with the component that uses it.

We chose the props approach because:
- `page.tsx` already had the `sponsorId` from the role check — no need to re-derive it.
- The props pattern makes the data flow explicit and testable (you can render `CampaignList` with mock data).
- Suspense adds complexity (fallback UI, streaming) that isn't needed for a single data fetch.
- For Challenge 5 (Server Actions with mutations), the props-based pattern integrates cleanly with `revalidatePath()`.

**Keeping `campaign-card.tsx` as `'use client'`:**
Could have left the `'use client'` directive on `CampaignCard` since it doesn't hurt functionality. Removed it because:
- It's unnecessary — the component has no client-side features.
- Leaving it would ship the component as client JavaScript, increasing bundle size for no reason.
- Challenge 5 will add edit/delete buttons that need interactivity — at that point, specific interactive parts can be wrapped in client components rather than making the entire card client-side.

## Trade-offs

- **No client-side loading spinner** — With server-side rendering, the browser shows nothing until the full HTML arrives. For a fast backend (local dev), this is imperceptible. For slow queries in production, adding a `loading.tsx` file in the route segment would show a streaming fallback.
- **No automatic refetch** — The old `useEffect` pattern would re-fetch on tab focus or session change. Server Components render once. For real-time updates, you'd add `revalidatePath()` in Server Actions (Challenge 5) or use a client-side polling wrapper.
- **Backend API still public** — Moving the fetch server-side hides the API URL from the browser, but the Express API itself is still unauthenticated (that's Challenge 3). The security improvement here is about reducing the attack surface visible to casual inspection, not about true endpoint protection.

## Existing TODOs Preserved

These TODOs were noted in the original files and are left for future challenges:

- `page.tsx` — `// TODO: Add CreateCampaignButton here`
- `campaign-list.tsx` — Sorting options (by date, budget, status), pagination
- `campaign-card.tsx` — `// TODO: Add edit/view buttons`
- Refetch on tab focus and optimistic updates (relevant in Challenge 5 with Server Actions)

## Files Changed

- `apps/frontend/app/dashboard/sponsor/page.tsx` — added server-side campaign fetch, passes data as props, renders error state
- `apps/frontend/app/dashboard/sponsor/components/campaign-list.tsx` — converted from client component with `useEffect` to presentational Server Component accepting `campaigns` prop
- `apps/frontend/app/dashboard/sponsor/components/campaign-card.tsx` — removed unnecessary `'use client'` directive

## Verification

`pnpm typecheck` passes cleanly on both backend and frontend after changes.

**Browser verification results:**

| Check | Result |
|---|---|
| Campaigns load without `useEffect` | ✅ "Q1 Product Launch" renders with budget, status, dates — no loading spinner flicker |
| Data in View Source (server-rendered) | ✅ Campaign name, budget, "ACTIVE" all present in raw HTML. No `useEffect` in page bundle |
| No client-side fetch to `/api/campaigns` | ✅ Zero requests to `/api/campaigns` from browser. Only client→backend request is `/api/auth/role` from the nav bar (separate component) |
| Error handling (backend down) | ✅ Page gracefully redirects to `/` — `getUserRole()` returns `{ role: null }` when backend is unreachable, triggering `redirect('/')` before the campaign fetch. No crash. The `try/catch` error state covers the narrower case where auth works but campaign query fails |
