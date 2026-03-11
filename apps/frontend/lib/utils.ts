// Frontend utility functions

// Format a price for display
export function formatPrice(price: number, locale = 'en-US') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'USD',
  }).format(price);
}

// Debounce function for search inputs
export function debounce<T extends (...args: unknown[]) => void>(fn: T, delay: number) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

// Parse query string parameters
export function parseQueryString(queryString: string): Record<string, string> {
  const params: Record<string, string> = {};
  const searchParams = new URLSearchParams(queryString);

  searchParams.forEach((value, key) => {
    params[key] = value;
  });

  return params;
}

// Check if we're running on the client side
export const isClient = typeof window !== 'undefined';

// Truncate text with ellipsis
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

// Class name helper (simple cn alternative)
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

// Sleep utility for testing/debugging
export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Deep clone an object
// NOTE: This doesn't handle circular references, dates, or functions
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// Logger that only logs in development
export const logger = {
  log: (...args: unknown[]) => {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log('[App]', ...args);
    }
  },
  error: (...args: unknown[]) => {
    // eslint-disable-next-line no-console
    console.error('[App Error]', ...args);
  },
  warn: (...args: unknown[]) => {
    // eslint-disable-next-line no-console
    console.warn('[App Warning]', ...args);
  },
};

export function formatRelativeTime(
  date: Date | string | number,
  {
    now = new Date(),
    locale = 'en-US',
    timeZone,
  }: { now?: Date; locale?: string; timeZone?: string } = {},
): string {
  const then = new Date(date);
  if (Number.isNaN(then.getTime())) return '-';

  const diffMs = then.getTime() - now.getTime();
  const absSeconds = Math.abs(diffMs) / 1000;

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  if (absSeconds < 60) return rtf.format(Math.round(diffMs / 1000), 'second');
  if (absSeconds < 60 * 60) return rtf.format(Math.round(diffMs / (1000 * 60)), 'minute');
  if (absSeconds < 60 * 60 * 24) return rtf.format(Math.round(diffMs / (1000 * 60 * 60)), 'hour');
  if (absSeconds < 60 * 60 * 24 * 7) return rtf.format(Math.round(diffMs / (1000 * 60 * 60 * 24)), 'day');

  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    ...(timeZone ? { timeZone } : {}),
  }).format(then);
}
