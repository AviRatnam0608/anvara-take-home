'use client';

import Link from 'next/link';
import type { ComponentType } from 'react';
import type { AdSlot } from '@/lib/types';
import {
  MagnifyingGlassIcon,
  MonitorIcon,
  VideoCameraIcon,
  ArticleIcon,
  EnvelopeSimpleIcon,
  MicrophoneIcon,
  ShieldCheckIcon,
  TrendUpIcon,
} from '@phosphor-icons/react';
import type { IconProps } from '@phosphor-icons/react';
import { trackMarketplaceEvent } from '@/lib/marketplace-analytics';

const typeColors: Record<string, string> = {
  DISPLAY: 'bg-[var(--color-primary-subtle)] text-[var(--color-primary)]',
  VIDEO: 'bg-[var(--color-error-subtle)] text-[var(--color-error)]',
  NATIVE: 'bg-[var(--color-success-subtle)] text-[var(--color-success)]',
  NEWSLETTER: 'bg-[var(--color-secondary-subtle)] text-[var(--color-secondary)]',
  PODCAST: 'bg-[var(--color-warning-subtle)] text-[var(--color-warning)]',
};

const typeIcons: Record<string, ComponentType<IconProps>> = {
  DISPLAY: MonitorIcon,
  VIDEO: VideoCameraIcon,
  NATIVE: ArticleIcon,
  NEWSLETTER: EnvelopeSimpleIcon,
  PODCAST: MicrophoneIcon,
};

interface AdSlotGridProps {
  adSlots: AdSlot[];
  page?: number;
  totalPages?: number;
  /** Current filter params to preserve in pagination links */
  filterParams?: string;
}

export function AdSlotGrid({ adSlots, page, totalPages, filterParams }: AdSlotGridProps) {
  function formatViews(views?: number): string | null {
    if (!views) return null;
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M views/mo`;
    if (views >= 1000) return `${Math.round(views / 1000)}K views/mo`;
    return `${views} views/mo`;
  }

  if (adSlots.length === 0) {
    return (
      <div className="empty-state-card">
        <MagnifyingGlassIcon
          size={48}
          weight="duotone"
          className="mx-auto mb-4 text-[var(--color-text-muted)]"
        />
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
          No ad slots found
        </h3>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          There are no available ad slots matching your criteria. Try adjusting your filters.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="stagger-children card-grid">
        {adSlots.map((slot) => {
          const TypeIcon = typeIcons[slot.type];
          const placementCount = slot._count?.placements ?? 0;
          const hasMomentum = placementCount > 3;
          const viewsLabel = formatViews(slot.publisher?.monthlyViews);

          return (
            <Link
              key={slot.id}
              href={`/marketplace/${slot.id}`}
              className="group card-link flex flex-col"
              onClick={() =>
                trackMarketplaceEvent('marketplace_card_click', {
                  adSlotId: slot.id,
                  slotType: slot.type,
                })
              }
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  {TypeIcon && (
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${typeColors[slot.type] || ''}`}
                    >
                      <TypeIcon size={18} weight="duotone" />
                    </span>
                  )}
                  <h3 className="text-lg font-semibold text-[var(--color-text-primary)] transition-colors group-hover:text-[var(--color-primary)]">
                    {slot.name}
                  </h3>
                </div>
                <span
                  className={`badge ${typeColors[slot.type] || 'bg-[var(--color-bg-input)] text-[var(--color-text-muted)]'}`}
                >
                  {slot.type}
                </span>
              </div>

              {slot.publisher && (
                <p className="mb-2 text-sm text-[var(--color-text-muted)]">
                  by {slot.publisher.name}
                </p>
              )}

              {slot.description && (
                <p className="mb-4 text-sm leading-relaxed text-[var(--color-text-secondary)] line-clamp-2">
                  {slot.description}
                </p>
              )}

              <div className="mb-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-2.5 py-1 text-xs text-[var(--color-text-secondary)]">
                  <ShieldCheckIcon size={12} />
                  Verified Publisher
                </span>
                {viewsLabel && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-2.5 py-1 text-xs text-[var(--color-text-secondary)]">
                    {viewsLabel}
                  </span>
                )}
                {hasMomentum && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-[var(--color-success)]/25 bg-[var(--color-success-subtle)] px-2.5 py-1 text-xs text-[var(--color-success)]">
                    <TrendUpIcon size={12} />
                    Popular Choice
                  </span>
                )}
              </div>

              <div className="mt-auto flex items-center justify-between border-t border-[var(--color-border)] pt-4">
                <span className="flex items-center gap-1.5 text-sm font-medium">
                  <span
                    className={`inline-block h-2 w-2 rounded-full ${slot.isAvailable ? 'bg-[var(--color-success)]' : 'bg-[var(--color-text-muted)]'}`}
                    aria-hidden="true"
                  />
                  <span
                    className={
                      slot.isAvailable
                        ? 'text-[var(--color-success)]'
                        : 'text-[var(--color-text-muted)]'
                    }
                  >
                    {slot.isAvailable ? 'Available' : 'Booked'}
                  </span>
                </span>
                <div className="text-right">
                  <p className="text-xs text-[var(--color-text-muted)]">Starting at</p>
                  <span className="text-lg font-bold text-[var(--color-primary)]">
                    ${Number(slot.basePrice).toLocaleString()}/mo
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Pagination */}
      {page != null && totalPages != null && totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          {page > 1 ? (
            <Link
              href={`/marketplace?${filterParams ? `${filterParams}&` : ''}page=${page - 1}`}
              className="btn btn-secondary btn-md cursor-pointer"
            >
              Previous
            </Link>
          ) : (
            <button disabled className="btn btn-secondary btn-md" aria-disabled="true">
              Previous
            </button>
          )}
          <span className="text-sm text-[var(--color-text-secondary)]">
            Page {page} of {totalPages}
          </span>
          {page < totalPages ? (
            <Link
              href={`/marketplace?${filterParams ? `${filterParams}&` : ''}page=${page + 1}`}
              className="btn btn-secondary btn-md cursor-pointer"
            >
              Next
            </Link>
          ) : (
            <button disabled className="btn btn-secondary btn-md" aria-disabled="true">
              Next
            </button>
          )}
        </div>
      )}
    </div>
  );
}
