import Link from 'next/link';
import { headers } from 'next/headers';
import { auth } from '@/auth';
import { getUserRole } from '@/lib/auth-helpers';
import { serverApi } from '@/lib/server-api';
import type { AdSlot } from '@/lib/types';
import {
  ArrowLeftIcon,
  ClockIcon,
  EyeIcon,
  SealCheckIcon,
  ShieldCheckIcon,
} from '@phosphor-icons/react/dist/ssr';
import { BookingForm } from './components/booking-form';
import { RequestQuoteForm } from './components/request-quote-form';
import { UnbookButton } from './components/unbook-button';

const typeColors: Record<string, string> = {
  DISPLAY: 'bg-[var(--color-primary-subtle)] text-[var(--color-primary)]',
  VIDEO: 'bg-[var(--color-error-subtle)] text-[var(--color-error)]',
  NATIVE: 'bg-[var(--color-success-subtle)] text-[var(--color-success)]',
  NEWSLETTER: 'bg-[var(--color-secondary-subtle)] text-[var(--color-secondary)]',
  PODCAST: 'bg-[var(--color-warning-subtle)] text-[var(--color-warning)]',
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
  let userEmail: string | undefined;
  if (user?.id) {
    const roleData = await getUserRole(user.id);
    role = roleData.role;
    sponsorName = roleData.name ?? user.name ?? undefined;
    userEmail = user.email ?? undefined;
  }

  if (error || !adSlot) {
    return (
      <div className="animate-fade-in space-y-4">
        <Link
          href="/marketplace"
          className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-primary)]"
        >
          <ArrowLeftIcon size={16} />
          Back to Marketplace
        </Link>
        <div className="rounded-[var(--radius-md)] border border-[var(--color-error)]/20 bg-[var(--color-error-subtle)] p-4 text-[var(--color-error)]">
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
        className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-primary)]"
      >
        <ArrowLeftIcon size={16} />
        Back to Marketplace
      </Link>

      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-raised)] p-8">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{adSlot.name}</h1>
            {adSlot.publisher && (
              <p className="mt-1 text-[var(--color-text-secondary)]">
                by {adSlot.publisher.name}
                {adSlot.publisher.website && (
                  <>
                    {' · '}
                    <a
                      href={adSlot.publisher.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--color-primary)] hover:underline"
                    >
                      {adSlot.publisher.website}
                    </a>
                  </>
                )}
              </p>
            )}
          </div>
          <span
            className={`badge px-4 py-1.5 text-sm ${typeColors[adSlot.type] || 'bg-[var(--color-bg-input)] text-[var(--color-text-muted)]'}`}
          >
            {adSlot.type}
          </span>
        </div>

        {adSlot.description && (
          <p className="mb-6 text-base leading-relaxed text-[var(--color-text-secondary)]">
            {adSlot.description}
          </p>
        )}

        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          <div className="flex items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-3 py-2 text-sm">
            <ShieldCheckIcon size={16} className="text-[var(--color-success)]" />
            Verified publisher profile
          </div>
          <div className="flex items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-3 py-2 text-sm">
            <ClockIcon size={16} className="text-[var(--color-primary)]" />
            Typical response under 48 hours
          </div>
          <div className="flex items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-3 py-2 text-sm">
            <EyeIcon size={16} className="text-[var(--color-warning)]" />
            {adSlot.publisher?.monthlyViews
              ? `${Number(adSlot.publisher.monthlyViews).toLocaleString()} monthly views`
              : 'Audience metrics available on request'}
          </div>
        </div>

        <div className="mb-6 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-4">
          <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
            Why brands choose this placement
          </h2>
          <ul className="mt-2 space-y-1 text-sm text-[var(--color-text-secondary)]">
            <li>Direct publisher partnership and faster activation.</li>
            <li>Clear monthly pricing with no hidden platform fees.</li>
            <li>Custom packages available for compliance and procurement needs.</li>
          </ul>
        </div>

        <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-5">
          <div className="flex items-center gap-2">
            {adSlot.isAvailable ? (
              <>
                <SealCheckIcon size={20} weight="duotone" className="text-[var(--color-success)]" />
                <span className="text-sm font-medium text-[var(--color-success)]">Available</span>
              </>
            ) : (
              <>
                <span
                  className="inline-block h-2 w-2 rounded-full bg-[var(--color-text-muted)]"
                  aria-hidden="true"
                />
                <span className="text-sm font-medium text-[var(--color-text-muted)]">
                  Currently Booked
                </span>
                <span className="ml-2">
                  <UnbookButton adSlotId={adSlot.id} />
                </span>
              </>
            )}
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-[var(--color-primary)]">
              ${Number(adSlot.basePrice).toLocaleString()}
            </p>
            <p className="text-sm text-[var(--color-text-muted)]">per month</p>
          </div>
        </div>

        {/* Booking section */}
        {adSlot.isAvailable &&
          (role === 'sponsor' && sponsorName ? (
            <BookingForm adSlotId={adSlot.id} sponsorName={sponsorName} />
          ) : (
            <div className="mt-6 border-t border-[var(--color-border)] pt-6">
              <h2 className="mb-3 text-xl font-semibold">Instant booking is sponsor-only</h2>
              <p className="text-sm text-[var(--color-text-secondary)]">
                {user
                  ? 'Switch to a sponsor account to book immediately.'
                  : 'Create or log into a sponsor account to book this slot now.'}
              </p>
              <Link href="/login" className="btn btn-secondary btn-md mt-4 w-full cursor-pointer">
                Log In to Book
              </Link>
            </div>
          ))}

        {adSlot.isAvailable && (
          <RequestQuoteForm
            adSlotId={adSlot.id}
            adSlotName={adSlot.name}
            defaultCompanyName={role === 'sponsor' ? sponsorName : undefined}
            defaultEmail={userEmail}
          />
        )}
      </div>
    </div>
  );
}
