// Utility helpers for the API

// Helper to safely extract route/query params
// Express 5 types params as string | string[] — this normalizes to string
export function getParam(param: unknown): string {
  if (typeof param === 'string') return param;
  if (Array.isArray(param) && typeof param[0] === 'string') return param[0];
  return '';
}

// Helper to format currency values
export function formatCurrency(amount: number, currency = 'USD') {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  });
  return formatter.format(amount);
}

// Helper to calculate percentage change
export function calculatePercentChange(oldValue: number, newValue: number) {
  if (oldValue === 0) return newValue > 0 ? 100 : 0;
  return ((newValue - oldValue) / oldValue) * 100;
}

// Parse pagination params from query
export function parsePagination(query: Record<string, string | string[] | undefined>) {
  const page = parseInt(getParam(query.page)) || 1;
  const limit = parseInt(getParam(query.limit)) || 10;
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Helper to build filter object from query params
export const buildFilters = (
  query: Record<string, string | string[] | undefined>,
  allowedFields: string[],
) => {
  const filters: Record<string, string | string[] | undefined> = {};

  for (const field of allowedFields) {
    if (query[field] !== undefined) {
      filters[field] = query[field];
    }
  }

  return filters;
};

// Clamp a numeric value between min and max bounds
export function clampValue(value: number, min: number, max: number): number {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

// Format a date value to a locale date string
export function formatDate(date: string | number | Date): string {
  const parsed = new Date(date);
  if (isNaN(parsed.getTime())) return 'Invalid date';
  return parsed.toLocaleDateString();
}
