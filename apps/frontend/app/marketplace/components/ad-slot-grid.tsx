import Link from 'next/link';
import type { AdSlot } from '@/lib/types';
import {
  MagnifyingGlass,
  Monitor,
  VideoCamera,
  Article,
  EnvelopeSimple,
  Microphone,
} from '@phosphor-icons/react/dist/ssr';
import type { Icon } from '@phosphor-icons/react/dist/ssr';

const typeColors: Record<string, string> = {
  DISPLAY: 'bg-[var(--color-primary-subtle)] text-[var(--color-primary)]',
  VIDEO: 'bg-[var(--color-error-subtle)] text-[var(--color-error)]',
  NATIVE: 'bg-[var(--color-success-subtle)] text-[var(--color-success)]',
  NEWSLETTER: 'bg-[var(--color-secondary-subtle)] text-[var(--color-secondary)]',
  PODCAST: 'bg-[var(--color-warning-subtle)] text-[var(--color-warning)]',
};

const typeIcons: Record<string, Icon> = {
  DISPLAY: Monitor,
  VIDEO: VideoCamera,
  NATIVE: Article,
  NEWSLETTER: EnvelopeSimple,
  PODCAST: Microphone,
};

interface AdSlotGridProps {
  adSlots: AdSlot[];
  page?: number;
  totalPages?: number;
  /** Current filter params to preserve in pagination links */
  filterParams?: string;
}

export function AdSlotGrid({ adSlots, page, totalPages, filterParams }: AdSlotGridProps) {
  if (adSlots.length === 0) {
    return (
      <div className="empty-state-card">
        <MagnifyingGlass
          size={48}
          weight="duotone"
          className="mx-auto mb-4 text-[var(--color-text-muted)]"
        />
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">No ad slots found</h3>
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
          return (
            <Link
              key={slot.id}
              href={`/marketplace/${slot.id}`}
              className="group card-link flex flex-col"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  {TypeIcon && (
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${typeColors[slot.type] || ''}`}>
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
                <p className="mb-2 text-sm text-[var(--color-text-muted)]">by {slot.publisher.name}</p>
              )}

              {slot.description && (
                <p className="mb-4 text-sm leading-relaxed text-[var(--color-text-secondary)] line-clamp-2">
                  {slot.description}
                </p>
              )}

              <div className="mt-auto flex items-center justify-between border-t border-[var(--color-border)] pt-4">
                <span className="flex items-center gap-1.5 text-sm font-medium">
                  <span
                    className={`inline-block h-2 w-2 rounded-full ${slot.isAvailable ? 'bg-[var(--color-success)]' : 'bg-[var(--color-text-muted)]'}`}
                    aria-hidden="true"
                  />
                  <span className={slot.isAvailable ? 'text-[var(--color-success)]' : 'text-[var(--color-text-muted)]'}>
                    {slot.isAvailable ? 'Available' : 'Booked'}
                  </span>
                </span>
                <span className="text-lg font-bold text-[var(--color-primary)]">
                  ${Number(slot.basePrice).toLocaleString()}/mo
                </span>
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
