import type { AdSlot } from '@/lib/types';
import { Layout } from '@phosphor-icons/react/dist/ssr';
import { AdSlotCard } from './ad-slot-card';

interface AdSlotListProps {
  adSlots: AdSlot[];
}

export function AdSlotList({ adSlots }: AdSlotListProps) {
  if (adSlots.length === 0) {
    return (
      <div className="empty-state-card">
        <Layout
          size={48}
          weight="duotone"
          className="mx-auto mb-4 text-[var(--color-text-muted)]"
        />
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">No ad slots yet</h3>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Create your first ad slot to start earning from your content.
        </p>
      </div>
    );
  }

  return (
    <div className="stagger-children card-grid">
      {adSlots.map((slot) => (
        <AdSlotCard key={slot.id} adSlot={slot} />
      ))}
    </div>
  );
}
