import Link from 'next/link';
import type { AdSlot } from '@/lib/types';
import { MagnifyingGlass } from '@phosphor-icons/react/dist/ssr';

const typeColors: Record<string, string> = {
  DISPLAY: 'bg-[--color-primary-subtle] text-[--color-primary]',
  VIDEO: 'bg-[--color-error-subtle] text-[--color-error]',
  NATIVE: 'bg-[--color-success-subtle] text-[--color-success]',
  NEWSLETTER: 'bg-[--color-secondary-subtle] text-[--color-secondary]',
  PODCAST: 'bg-[--color-warning-subtle] text-[--color-warning]',
};

interface AdSlotGridProps {
  adSlots: AdSlot[];
}

export function AdSlotGrid({ adSlots }: AdSlotGridProps) {
  if (adSlots.length === 0) {
    return (
      <div className="empty-state-card">
        <MagnifyingGlass
          size={48}
          weight="duotone"
          className="mx-auto mb-4 text-[--color-text-muted]"
        />
        <h3 className="text-lg font-semibold text-[--color-text-primary]">No ad slots found</h3>
        <p className="mt-1 text-sm text-[--color-text-secondary]">
          There are no available ad slots at the moment. Check back later!
        </p>
      </div>
    );
  }

  return (
    <div className="stagger-children card-grid">
      {adSlots.map((slot) => (
        <Link
          key={slot.id}
          href={`/marketplace/${slot.id}`}
          className="group card-link"
        >
          <div className="mb-3 flex items-start justify-between gap-3">
            <h3 className="text-lg font-semibold text-[--color-text-primary] transition-colors group-hover:text-[--color-primary]">
              {slot.name}
            </h3>
            <span
              className={`badge ${typeColors[slot.type] || 'bg-[--color-bg-input] text-[--color-text-muted]'}`}
            >
              {slot.type}
            </span>
          </div>

          {slot.publisher && (
            <p className="mb-2 text-sm text-[--color-text-muted]">by {slot.publisher.name}</p>
          )}

          {slot.description && (
            <p className="mb-4 text-sm leading-relaxed text-[--color-text-secondary] line-clamp-2">
              {slot.description}
            </p>
          )}

          <div className="flex items-center justify-between border-t border-[--color-border] pt-4">
            <span className="flex items-center gap-1.5 text-sm font-medium">
              <span
                className={`inline-block h-2 w-2 rounded-full ${slot.isAvailable ? 'bg-[--color-success]' : 'bg-[--color-text-muted]'}`}
                aria-hidden="true"
              />
              <span className={slot.isAvailable ? 'text-[--color-success]' : 'text-[--color-text-muted]'}>
                {slot.isAvailable ? 'Available' : 'Booked'}
              </span>
            </span>
            <span className="text-lg font-bold text-[--color-primary]">
              ${Number(slot.basePrice).toLocaleString()}/mo
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
