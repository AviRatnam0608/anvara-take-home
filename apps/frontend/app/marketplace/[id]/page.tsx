import Link from 'next/link';
import { headers } from 'next/headers';
import { auth } from '@/auth';
import { getUserRole } from '@/lib/auth-helpers';
import { serverApi } from '@/lib/server-api';
import type { AdSlot } from '@/lib/types';
import { ArrowLeft, SealCheck } from '@phosphor-icons/react/dist/ssr';
import { BookingForm } from './components/booking-form';
import { UnbookButton } from './components/unbook-button';

const typeColors: Record<string, string> = {
  DISPLAY: 'bg-[--color-primary-subtle] text-[--color-primary]',
  VIDEO: 'bg-[--color-error-subtle] text-[--color-error]',
  NATIVE: 'bg-[--color-success-subtle] text-[--color-success]',
  NEWSLETTER: 'bg-[--color-secondary-subtle] text-[--color-secondary]',
  PODCAST: 'bg-[--color-warning-subtle] text-[--color-warning]',
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdSlotPage({ params }: Props) {
  const { id } = await params;

  const { data: adSlot, error } = await serverApi<AdSlot>(`/api/ad-slots/${id}`);

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
      <div className="animate-fade-in space-y-4">
        <Link
          href="/marketplace"
          className="inline-flex items-center gap-2 text-sm font-medium text-[--color-text-secondary] transition-colors hover:text-[--color-primary]"
        >
          <ArrowLeft size={16} />
          Back to Marketplace
        </Link>
        <div className="rounded-[--radius-md] border border-[--color-error]/20 bg-[--color-error-subtle] p-4 text-[--color-error]">
          <p className="font-medium">Unable to load ad slot</p>
          <p className="mt-1 text-sm opacity-80">{error || 'Ad slot not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <Link
        href="/marketplace"
        className="inline-flex items-center gap-2 text-sm font-medium text-[--color-text-secondary] transition-colors hover:text-[--color-primary]"
      >
        <ArrowLeft size={16} />
        Back to Marketplace
      </Link>

      <div className="rounded-2xl border border-[--color-border] bg-[--color-bg-raised] p-8">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{adSlot.name}</h1>
            {adSlot.publisher && (
              <p className="mt-1 text-[--color-text-secondary]">
                by {adSlot.publisher.name}
                {adSlot.publisher.website && (
                  <>
                    {' · '}
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
          <span
            className={`badge px-4 py-1.5 text-sm ${typeColors[adSlot.type] || 'bg-[--color-bg-input] text-[--color-text-muted]'}`}
          >
            {adSlot.type}
          </span>
        </div>

        {adSlot.description && (
          <p className="mb-6 text-base leading-relaxed text-[--color-text-secondary]">
            {adSlot.description}
          </p>
        )}

        <div className="flex items-center justify-between border-t border-[--color-border] pt-5">
          <div className="flex items-center gap-2">
            {adSlot.isAvailable ? (
              <>
                <SealCheck size={20} weight="duotone" className="text-[--color-success]" />
                <span className="text-sm font-medium text-[--color-success]">Available</span>
              </>
            ) : (
              <>
                <span
                  className="inline-block h-2 w-2 rounded-full bg-[--color-text-muted]"
                  aria-hidden="true"
                />
                <span className="text-sm font-medium text-[--color-text-muted]">
                  Currently Booked
                </span>
                <span className="ml-2">
                  <UnbookButton adSlotId={adSlot.id} />
                </span>
              </>
            )}
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-[--color-primary]">
              ${Number(adSlot.basePrice).toLocaleString()}
            </p>
            <p className="text-sm text-[--color-text-muted]">per month</p>
          </div>
        </div>

        {/* Booking section */}
        {adSlot.isAvailable &&
          (role === 'sponsor' && sponsorName ? (
            <BookingForm adSlotId={adSlot.id} sponsorName={sponsorName} />
          ) : (
            <div className="mt-6 border-t border-[--color-border] pt-6">
              <h2 className="mb-4 text-xl font-semibold">Request This Placement</h2>
              <button
                disabled
                className="min-h-[48px] w-full cursor-not-allowed rounded-[--radius-md] border border-[--color-border] bg-[--color-bg-input] px-4 py-3 font-semibold text-[--color-text-muted]"
              >
                Request This Placement
              </button>
              <p className="mt-3 text-center text-sm text-[--color-text-muted]">
                {user
                  ? 'Only sponsors can request placements'
                  : 'Log in as a sponsor to request this placement'}
              </p>
            </div>
          ))}
      </div>
    </div>
  );
}
