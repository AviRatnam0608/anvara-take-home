'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useTransition } from 'react';
import { MagnifyingGlassIcon } from '@phosphor-icons/react';

const AD_SLOT_TYPES = ['DISPLAY', 'VIDEO', 'NATIVE', 'NEWSLETTER', 'PODCAST'] as const;

export function MarketplaceFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentSearch = searchParams.get('search') ?? '';
  const currentType = searchParams.get('type') ?? '';
  const currentMinPrice = searchParams.get('minPrice') ?? '';
  const currentMaxPrice = searchParams.get('maxPrice') ?? '';

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(updates)) {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      }

      // Reset to page 1 when filters change
      params.delete('page');

      startTransition(() => {
        router.push(`/marketplace?${params.toString()}`);
      });
    },
    [searchParams, router],
  );

  return (
    <div
      className={`card space-y-4 transition-opacity ${isPending ? 'opacity-60' : ''}`}
    >
      {/* Search + Type row */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <MagnifyingGlassIcon
            size={18}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
          />
          <input
            type="text"
            placeholder="Search by name or publisher..."
            defaultValue={currentSearch}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                updateParams({ search: e.currentTarget.value });
              }
            }}
            onBlur={(e) => {
              if (e.target.value !== currentSearch) {
                updateParams({ search: e.target.value });
              }
            }}
            className="!pl-10"
          />
        </div>

        <select
          defaultValue={currentType}
          onChange={(e) => updateParams({ type: e.target.value })}
          className="sm:w-48"
        >
          <option value="">All Types</option>
          {AD_SLOT_TYPES.map((type) => (
            <option key={type} value={type}>
              {type.charAt(0) + type.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
      </div>

      {/* Price range row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <span className="text-sm font-medium text-[var(--color-text-secondary)]">
          Price range:
        </span>
        <div className="flex items-center gap-2">
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-text-muted)]">
              $
            </span>
            <input
              type="number"
              placeholder="Min"
              min={0}
              defaultValue={currentMinPrice}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  updateParams({ minPrice: e.currentTarget.value });
                }
              }}
              onBlur={(e) => {
                if (e.target.value !== currentMinPrice) {
                  updateParams({ minPrice: e.target.value });
                }
              }}
              className="w-28 !pl-7"
            />
          </div>
          <span className="text-[var(--color-text-muted)]">-</span>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-text-muted)]">
              $
            </span>
            <input
              type="number"
              placeholder="Max"
              min={0}
              defaultValue={currentMaxPrice}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  updateParams({ maxPrice: e.currentTarget.value });
                }
              }}
              onBlur={(e) => {
                if (e.target.value !== currentMaxPrice) {
                  updateParams({ maxPrice: e.target.value });
                }
              }}
              className="w-28 !pl-7"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
