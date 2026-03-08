import { describe, it, expect } from 'vitest';
import {
  getParam,
  formatCurrency,
  calculatePercentChange,
  parsePagination,
  isValidEmail,
  buildFilters,
  clampValue,
  formatDate,
} from './helpers.js';

describe('getParam', () => {
  it('returns string when given a string', () => {
    expect(getParam('hello')).toBe('hello');
  });

  it('returns first element when given string[]', () => {
    expect(getParam(['first', 'second'])).toBe('first');
  });

  it('returns empty string when given undefined', () => {
    expect(getParam(undefined)).toBe('');
  });

  it('returns empty string when given empty array', () => {
    expect(getParam([])).toBe('');
  });

  it('returns empty string when given a number', () => {
    expect(getParam(42)).toBe('');
  });
});

describe('formatCurrency', () => {
  it('formats whole number as USD by default', () => {
    expect(formatCurrency(1000)).toBe('$1,000.00');
  });

  it('formats decimal value correctly', () => {
    expect(formatCurrency(49.99)).toBe('$49.99');
  });

  it('handles zero', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('handles negative amounts', () => {
    expect(formatCurrency(-500)).toBe('-$500.00');
  });

  it('formats with custom currency code', () => {
    const result = formatCurrency(1000, 'EUR');
    // Intl formatting may vary by locale, just check it contains the amount
    expect(result).toContain('1,000.00');
  });
});

describe('calculatePercentChange', () => {
  it('returns correct percentage for increase', () => {
    expect(calculatePercentChange(100, 150)).toBe(50);
  });

  it('returns correct percentage for decrease', () => {
    expect(calculatePercentChange(200, 100)).toBe(-50);
  });

  it('returns 100 when old value is 0 and new value is positive', () => {
    expect(calculatePercentChange(0, 50)).toBe(100);
  });

  it('returns 0 when both values are 0', () => {
    expect(calculatePercentChange(0, 0)).toBe(0);
  });
});

describe('parsePagination', () => {
  it('returns defaults for empty query', () => {
    expect(parsePagination({})).toEqual({ page: 1, limit: 10, skip: 0 });
  });

  it('parses valid page and limit', () => {
    expect(parsePagination({ page: '3', limit: '20' })).toEqual({
      page: 3,
      limit: 20,
      skip: 40,
    });
  });

  it('calculates skip correctly', () => {
    const result = parsePagination({ page: '5', limit: '10' });
    expect(result.skip).toBe(40);
  });

  it('defaults to page 1 for non-numeric value', () => {
    expect(parsePagination({ page: 'abc' })).toEqual({ page: 1, limit: 10, skip: 0 });
  });

  it('handles string[] values (Express 5 param format)', () => {
    expect(parsePagination({ page: ['2', '3'], limit: ['5'] })).toEqual({
      page: 2,
      limit: 5,
      skip: 5,
    });
  });
});

describe('isValidEmail', () => {
  it('returns true for valid email', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
  });

  it('returns false for missing @ symbol', () => {
    expect(isValidEmail('userexample.com')).toBe(false);
  });

  it('returns false for missing domain', () => {
    expect(isValidEmail('user@')).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(isValidEmail('')).toBe(false);
  });

  it('returns false for email with spaces', () => {
    expect(isValidEmail('user @example.com')).toBe(false);
  });
});

describe('buildFilters', () => {
  it('returns empty object when query has no matching fields', () => {
    expect(buildFilters({ foo: 'bar' }, ['status', 'type'])).toEqual({});
  });

  it('picks only allowed fields from query', () => {
    expect(buildFilters({ status: 'ACTIVE', type: 'DISPLAY', foo: 'bar' }, ['status', 'type'])).toEqual({
      status: 'ACTIVE',
      type: 'DISPLAY',
    });
  });

  it('ignores undefined values', () => {
    expect(buildFilters({ status: undefined }, ['status'])).toEqual({});
  });
});

describe('clampValue', () => {
  it('returns value when within bounds', () => {
    expect(clampValue(5, 0, 10)).toBe(5);
  });

  it('returns min when value is below min', () => {
    expect(clampValue(-5, 0, 10)).toBe(0);
  });

  it('returns max when value is above max', () => {
    expect(clampValue(15, 0, 10)).toBe(10);
  });

  it('handles equal min and max', () => {
    expect(clampValue(5, 3, 3)).toBe(3);
  });
});

describe('formatDate', () => {
  it('formats a valid date string', () => {
    const result = formatDate('2026-01-15');
    expect(result).not.toBe('Invalid date');
    expect(result).toContain('2026');
  });

  it('formats a Date object', () => {
    const result = formatDate(new Date('2026-06-01'));
    expect(result).not.toBe('Invalid date');
  });

  it('formats a timestamp number', () => {
    const result = formatDate(1735689600000); // 2025-01-01
    expect(result).not.toBe('Invalid date');
  });

  it('returns "Invalid date" for invalid input', () => {
    expect(formatDate('not-a-date')).toBe('Invalid date');
  });
});
