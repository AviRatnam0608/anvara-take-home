import Link from 'next/link';
import { headers } from 'next/headers';
import { auth } from '@/auth';
import { getUserRole } from '@/lib/auth-helpers';
import { serverApi } from '@/lib/server-api';
import type { AdSlot } from '@/lib/types';
import { BookingForm } from './components/booking-form';
import { UnbookButton } from './components/unbook-button';

const typeColors: Record<string, string> = {
  DISPLAY: 'bg-blue-100 text-blue-700',
  VIDEO: 'bg-red-100 text-red-700',
  NEWSLETTER: 'bg-purple-100 text-purple-700',
  PODCAST: 'bg-orange-100 text-orange-700',
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdSlotPage({ params }: Props) {
  const { id } = await params;

  // Fetch ad slot server-side
  const { data: adSlot, error } = await serverApi<AdSlot>(`/api/ad-slots/${id}`);

  // Fetch session server-side (no client auth waterfall)
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user ?? null;

  let role: 'sponsor' | 'publisher' | null = null;
  let sponsorName: string | undefined;
  if (user?.id) {
    const roleData = await getUserRole(user.id);
    role = roleData.role;
    sponsorName = roleData.name ?? user.name ?? undefined;
  }

  if (error || !adSlot) {
    return (
      <div className="space-y-4">
        <Link href="/marketplace" className="text-[--color-primary] hover:underline">
          ← Back to Marketplace
        </Link>
        <div className="rounded border border-red-200 bg-red-50 p-4 text-red-600">
          {error || 'Ad slot not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link href="/marketplace" className="text-[--color-primary] hover:underline">
        ← Back to Marketplace
      </Link>

      <div className="rounded-lg border border-[--color-border] p-6">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{adSlot.name}</h1>
            {adSlot.publisher && (
              <p className="text-[--color-muted]">
                by {adSlot.publisher.name}
                {adSlot.publisher.website && (
                  <>
                    {' '}
                    ·{' '}
                    <a
                      href={adSlot.publisher.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[--color-primary] hover:underline"
                    >
                      {adSlot.publisher.website}
                    </a>
                  </>
                )}
              </p>
            )}
          </div>
          <span className={`rounded px-3 py-1 text-sm ${typeColors[adSlot.type] || 'bg-gray-100'}`}>
            {adSlot.type}
          </span>
        </div>

        {adSlot.description && <p className="mb-6 text-[--color-muted]">{adSlot.description}</p>}

        <div className="flex items-center justify-between border-t border-[--color-border] pt-4">
          <div>
            <span
              className={`text-sm font-medium ${adSlot.isAvailable ? 'text-green-600' : 'text-[--color-muted]'}`}
            >
              {adSlot.isAvailable ? '● Available' : '○ Currently Booked'}
            </span>
            {!adSlot.isAvailable && (
              <span className="ml-3">
                <UnbookButton adSlotId={adSlot.id} />
              </span>
            )}
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-[--color-primary]">
              ${Number(adSlot.basePrice).toLocaleString()}
            </p>
            <p className="text-sm text-[--color-muted]">per month</p>
          </div>
        </div>

        {/* Booking section — only shown when available */}
        {adSlot.isAvailable && (
          role === 'sponsor' && sponsorName ? (
            <BookingForm adSlotId={adSlot.id} sponsorName={sponsorName} />
          ) : (
            <div className="mt-6 border-t border-[--color-border] pt-6">
              <h2 className="mb-4 text-lg font-semibold">Request This Placement</h2>
              <button
                disabled
                className="w-full cursor-not-allowed rounded-lg bg-gray-300 px-4 py-3 font-semibold text-gray-500"
              >
                Request This Placement
              </button>
              <p className="mt-2 text-center text-sm text-[--color-muted]">
                {user
                  ? 'Only sponsors can request placements'
                  : 'Log in as a sponsor to request this placement'}
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
