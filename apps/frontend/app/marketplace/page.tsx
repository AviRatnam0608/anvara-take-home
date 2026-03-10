import { serverApi } from '@/lib/server-api';
import type { AdSlot } from '@/lib/types';
import { AdSlotGrid } from './components/ad-slot-grid';

export default async function MarketplacePage() {
  const { data: adSlots, error } = await serverApi<AdSlot[]>('/api/ad-slots');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Marketplace</h1>
        <p className="text-[--color-muted]">Browse available ad slots from our publishers</p>
      </div>

      {error ? (
        <div className="rounded border border-red-200 bg-red-50 p-4 text-red-600">{error}</div>
      ) : (
        <AdSlotGrid adSlots={adSlots ?? []} />
      )}
    </div>
  );
}
