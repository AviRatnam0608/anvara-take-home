# Challenge 4: Complete CRUD Operations

## Overview

Added the missing PUT (update) and DELETE endpoints for both campaigns and ad slots, fixed the broken POST `/api/ad-slots` validation, and added corresponding frontend API client functions.

## Changes Made

### 1. PUT /api/campaigns/:id — Update Campaign (SPONSOR only)

**File:** `apps/backend/src/routes/campaigns.ts`

Allows sponsors to update their own campaigns. Supports updating: `name`, `description`, `budget`, `cpmRate`, `cpcRate`, `startDate`, `endDate`, `targetCategories`, `targetRegions`, `status`.

**Key behaviors:**
- **Role guard:** Returns 403 if the user is not a SPONSOR
- **Ownership check:** Uses `findFirst({ where: { id, sponsorId } })` — returns 404 for both "not found" and "not owned" (doesn't reveal resource existence to unauthorized users)
- **Field validation:** Only includes fields that were actually provided in the request body. Returns 400 if no valid fields are sent
- **Status enum validation:** Validates `status` against the `CampaignStatus` enum before passing to Prisma, preventing raw Prisma errors from leaking internal details

### 2. DELETE /api/campaigns/:id — Delete Campaign (SPONSOR only)

**File:** `apps/backend/src/routes/campaigns.ts`

Allows sponsors to delete their own campaigns.

**Key behaviors:**
- Same role guard and ownership check pattern as PUT
- Returns **204 No Content** (REST convention for successful deletes — no response body)
- Prisma's `onDelete: Cascade` on Campaign→Creative and Campaign→Placement relations automatically cleans up related records

### 3. PUT /api/ad-slots/:id — Update Ad Slot (PUBLISHER only)

**File:** `apps/backend/src/routes/adSlots.ts`

Allows publishers to update their own ad slots. Supports updating: `name`, `description`, `type`, `position`, `width`, `height`, `basePrice`, `cpmFloor`, `isAvailable`.

**Key behaviors:**
- Same pattern as campaign PUT: role guard → ownership check → field validation → update
- Validates `type` against the `AdSlotType` enum if provided

### 4. DELETE /api/ad-slots/:id — Delete Ad Slot (PUBLISHER only)

**File:** `apps/backend/src/routes/adSlots.ts`

Same pattern as campaign DELETE. Returns 204. Cascade handles Placement cleanup.

### 5. Fixed "Broken" POST /api/ad-slots

**File:** `apps/backend/src/routes/adSlots.ts`

The existing POST endpoint didn't validate the `type` field against the `AdSlotType` enum. When given an invalid type (e.g., `"INVALID"`), Prisma would throw a raw `PrismaClientValidationError` with a stack trace, leaking internal implementation details.

**Fix:** Added upfront validation against the `VALID_AD_SLOT_TYPES` array (`DISPLAY`, `VIDEO`, `NATIVE`, `NEWSLETTER`, `PODCAST`). Invalid types now return a clean 400 response with a user-friendly message listing valid options.

### 6. Frontend API Client Functions

**File:** `apps/frontend/lib/api.ts`

Added the four missing functions that were marked with TODO comments:

- `updateCampaign(id, data, options?)` → `PUT /api/campaigns/:id`
- `deleteCampaign(id, options?)` → `DELETE /api/campaigns/:id`
- `updateAdSlot(id, data, options?)` → `PUT /api/ad-slots/:id`
- `deleteAdSlot(id, options?)` → `DELETE /api/ad-slots/:id`

All functions follow the existing pattern: use the shared `api()` helper with `credentials: 'include'` and accept an optional `RequestInit` for server-side cookie forwarding.

## Design Decisions

### Why `findFirst` + separate `update`/`delete` instead of `update({ where: { id, sponsorId } })`?

Prisma's `update()` and `delete()` only accept **unique fields** in the `where` clause (i.e., just `id`). Since `sponsorId`/`publisherId` is not part of the unique constraint, we can't compose them in a single query. The two-step pattern is:

1. `findFirst({ where: { id, sponsorId } })` — verify ownership
2. If null → 404
3. `update({ where: { id } })` — safe because ownership was already verified

### Why return 404 instead of 403 for not-owned resources?

Returning 403 would confirm the resource exists to an unauthorized user. Returning 404 is ambiguous — the resource either doesn't exist or isn't accessible. This is a security best practice to prevent information disclosure.

### Why validate enums in the handler instead of letting Prisma error?

Prisma throws `PrismaClientValidationError` with full stack traces for invalid enum values. This leaks internal details (ORM name, schema structure, file paths). Validating upfront gives a clean 400 with a user-friendly message listing valid options.

### Why 204 No Content for DELETE?

REST convention: a successful delete returns no response body. Using `res.status(204).send()` (not `.json()`) since 204 explicitly means "no content."

## Tests Added

### Backend — campaigns.test.ts (+13 tests)

| Test | Assertion |
|---|---|
| PUT — 403 for publisher | Role guard blocks non-sponsors |
| PUT — 404 for not-owned | Ownership check returns 404, not 403 |
| PUT — 400 empty body | Requires at least one field |
| PUT — 400 invalid status | Enum validation returns clean error |
| PUT — 200 valid update | Name and budget updated correctly |
| PUT — 200 valid status change | Status enum accepted when valid |
| PUT — ownership via findFirst | Verifies sponsorId in where clause |
| PUT — 500 on DB error | Graceful error handling |
| DELETE — 403 for publisher | Role guard blocks non-sponsors |
| DELETE — 404 not-owned | Ownership check |
| DELETE — 204 success | No response body, correct status |
| DELETE — ownership verification | findFirst called with sponsorId |
| DELETE — 500 on DB error | Graceful error handling |

### Backend — adSlots.test.ts (+14 tests)

| Test | Assertion |
|---|---|
| POST — 400 invalid type | New test for the broken POST fix |
| PUT — 403 for sponsor | Role guard blocks non-publishers |
| PUT — 404 for not-owned | Ownership check |
| PUT — 400 empty body | Requires at least one field |
| PUT — 400 invalid type | Enum validation |
| PUT — 200 valid update | Name and basePrice updated |
| PUT — 200 valid type change | Type enum accepted when valid |
| PUT — ownership via findFirst | Verifies publisherId in where clause |
| PUT — 500 on DB error | Graceful error handling |
| DELETE — 403 for sponsor | Role guard blocks non-publishers |
| DELETE — 404 not-owned | Ownership check |
| DELETE — 204 success | No response body |
| DELETE — ownership verification | findFirst called with publisherId |
| DELETE — 500 on DB error | Graceful error handling |

**Total test count:** 126 (110 backend + 16 frontend), all passing.

## Verification Results

All endpoints verified via browser with live database:

| Test | Expected | Actual |
|---|---|---|
| PUT campaign — update name/budget | 200 | ✅ 200 |
| PUT campaign — invalid status | 400 | ✅ 400 |
| PUT campaign — empty body | 400 | ✅ 400 |
| PUT campaign — valid status change | 200 | ✅ 200 |
| PUT campaign — cross-user | 404 | ✅ 404 |
| DELETE campaign — cross-user | 404 | ✅ 404 |
| PUT ad-slot — update name/type | 200 | ✅ 200 |
| PUT ad-slot — invalid type | 400 | ✅ 400 |
| POST ad-slot — invalid type (broken fix) | 400 | ✅ 400 |
| DELETE ad-slot — full lifecycle | 201→200→204→404 | ✅ All correct |
| Cross-role — sponsor → ad-slot PUT/DELETE | 403 | ✅ 403 |
| Cross-role — publisher → campaign PUT/DELETE | 403 | ✅ 403 |
| Unauthenticated → PUT/DELETE | 401 | ✅ 401 |

## Files Modified

| File | Change |
|---|---|
| `apps/backend/src/routes/campaigns.ts` | Added PUT and DELETE handlers with role guards, ownership checks, and enum validation |
| `apps/backend/src/routes/adSlots.ts` | Added type enum validation to POST, added PUT and DELETE handlers |
| `apps/frontend/lib/api.ts` | Added `updateCampaign`, `deleteCampaign`, `updateAdSlot`, `deleteAdSlot` functions |
| `apps/backend/src/routes/campaigns.test.ts` | Added 13 tests for PUT and DELETE |
| `apps/backend/src/routes/adSlots.test.ts` | Added 14 tests for PUT, DELETE, and POST type validation |
