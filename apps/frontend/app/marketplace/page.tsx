import { serverApi } from '@/lib/server-api';
import type { AdSlot } from '@/lib/types';
import { AdSlotGrid } from './components/ad-slot-grid';

export default async function MarketplacePage() {
  const { data: adSlots, error } = await serverApi<AdSlot[]>('/api/ad-slots');

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Marketplace</h1>
        <p className="mt-1 text-[var(--color-text-secondary)]">
          Browse available ad slots from our publishers
        </p>
      </div>

      {error ? (
        <div className="alert-error">
          <p className="font-medium">Unable to load ad slots</p>
          <p className="mt-1 text-sm opacity-80">Please check your connection and try again.</p>
        </div>
      ) : (
        <AdSlotGrid adSlots={adSlots ?? []} />
      )}
    </div>
  );
}
