import { serverApi } from '@/lib/server-api';
import type { AdSlot } from '@/lib/types';
import { AdSlotGrid } from './components/ad-slot-grid';
import { MarketplaceFilters } from './components/marketplace-filters';

interface PaginatedAdSlots {
  data: AdSlot[];
  total: number;
  page: number;
  totalPages: number;
}

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  // Build query string from searchParams
  const qs = new URLSearchParams();
  if (params.search) qs.set('search', String(params.search));
  if (params.type) qs.set('type', String(params.type));
  if (params.minPrice) qs.set('minPrice', String(params.minPrice));
  if (params.maxPrice) qs.set('maxPrice', String(params.maxPrice));
  qs.set('page', params.page ? String(params.page) : '1');
  qs.set('limit', '12');

  const { data, error } = await serverApi<PaginatedAdSlots>(
    `/api/ad-slots?${qs.toString()}`,
  );

  // Build filter params string (excluding page) for pagination links
  const filterQs = new URLSearchParams();
  if (params.search) filterQs.set('search', String(params.search));
  if (params.type) filterQs.set('type', String(params.type));
  if (params.minPrice) filterQs.set('minPrice', String(params.minPrice));
  if (params.maxPrice) filterQs.set('maxPrice', String(params.maxPrice));
  const filterParams = filterQs.toString();

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Marketplace</h1>
        <p className="mt-1 text-[var(--color-text-secondary)]">
          Browse available ad slots from our publishers
        </p>
      </div>

      <MarketplaceFilters />

      {error ? (
        <div className="alert-error">
          <p className="font-medium">Unable to load ad slots</p>
          <p className="mt-1 text-sm opacity-80">Please check your connection and try again.</p>
        </div>
      ) : (
        <AdSlotGrid
          adSlots={data?.data ?? []}
          page={data?.page}
          totalPages={data?.totalPages}
          filterParams={filterParams}
        />
      )}
    </div>
  );
}
