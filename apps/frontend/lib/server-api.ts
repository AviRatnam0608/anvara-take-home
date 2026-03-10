'use server';

import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4291';

/**
 * Server-side API helper that forwards the session cookie to the backend.
 * Use this in Server Actions and Server Components instead of the client-side `api()`.
 *
 * Key differences from `lib/api.ts`:
 * - Reads cookies via `next/headers` (not `credentials: 'include'`, which is browser-only)
 * - Parses backend error messages instead of throwing generic errors
 * - Runs only on the server (marked with 'use server')
 */
export async function serverApi<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<{ data?: T; error?: string }> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join('; ');

  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookieHeader,
        ...options?.headers,
      },
    });

    // DELETE returns 204 No Content — no body to parse
    if (res.status === 204) {
      return { data: undefined as T };
    }

    if (!res.ok) {
      // Try to extract the backend's error message
      try {
        const body = await res.json();
        return { error: body.error || `Request failed (${res.status})` };
      } catch {
        return { error: `Request failed (${res.status})` };
      }
    }

    const data = await res.json();
    return { data };
  } catch {
    return { error: 'Network error — could not reach the server' };
  }
}
