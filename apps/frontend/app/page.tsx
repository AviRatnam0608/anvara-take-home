import Link from 'next/link';
import {
  MegaphoneIcon,
  LayoutIcon,
  ChartLineUpIcon,
  ArrowRightIcon,
  StorefrontIcon,
  ShieldCheckIcon,
  LightningIcon,
} from '@phosphor-icons/react/dist/ssr';

export default function Home() {
  return (
    <div className="animate-fade-in">
      {/* ─── Hero ────────────────────────────────────────────────── */}
      <section className="relative flex min-h-[65vh] flex-col items-center justify-center text-center">
        {/* Radial glow */}
        <div
          className="pointer-events-none absolute inset-0 -top-32"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(37,99,235,0.10) 0%, transparent 70%)',
          }}
          aria-hidden="true"
        />

        <h1 className="relative text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          The Modern{' '}
          <span className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] bg-clip-text text-transparent">
            Sponsorship
          </span>
          <br />
          Marketplace
        </h1>

        <p className="relative mx-auto mt-6 max-w-lg text-lg text-[var(--color-text-secondary)]">
          Connect sponsors with premium publishers. Launch campaigns, manage ad slots, and grow your
          reach — all in one place.
        </p>

        <div className="relative mt-10 flex flex-col gap-4 sm:flex-row">
          <Link href="/login" className="btn btn-primary btn-lg px-8">
            Get Started
            <ArrowRightIcon size={18} />
          </Link>
          <Link href="/marketplace" className="btn btn-secondary btn-lg px-8">
            <StorefrontIcon size={18} />
            Browse Marketplace
          </Link>
        </div>
      </section>

      {/* ─── Features ────────────────────────────────────────────── */}
      <section className="mt-8 mb-16">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Everything you need to grow
          </h2>
          <p className="mt-2 text-[var(--color-text-secondary)]">
            Powerful tools for both sponsors and publishers.
          </p>
        </div>

        <div className="card-grid">
          <div className="card p-8 hover:shadow-lg hover:shadow-black/5">
            <div className="mb-4 inline-flex rounded-[var(--radius-md)] bg-[var(--color-primary-subtle)] p-3">
              <MegaphoneIcon size={28} weight="duotone" className="text-[var(--color-primary)]" />
            </div>
            <h3 className="text-lg font-semibold">For Sponsors</h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
              Create targeted campaigns, set budgets, and reach your audience through premium
              publisher placements.
            </p>
          </div>

          <div className="card p-8 hover:shadow-lg hover:shadow-black/5">
            <div className="mb-4 inline-flex rounded-[var(--radius-md)] bg-[var(--color-secondary-subtle)] p-3">
              <LayoutIcon size={28} weight="duotone" className="text-[var(--color-secondary)]" />
            </div>
            <h3 className="text-lg font-semibold">For Publishers</h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
              List your ad slots, set your rates, and connect with sponsors looking for your
              audience.
            </p>
          </div>

          <div className="card p-8 hover:shadow-lg hover:shadow-black/5 sm:col-span-2 lg:col-span-1">
            <div className="mb-4 inline-flex rounded-[var(--radius-md)] bg-[var(--color-success-subtle)] p-3">
              <ChartLineUpIcon size={28} weight="duotone" className="text-[var(--color-success)]" />
            </div>
            <h3 className="text-lg font-semibold">Real-Time Analytics</h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
              Track impressions, clicks, and conversions. Optimize campaigns with data-driven
              insights.
            </p>
          </div>
        </div>
      </section>

      {/* ─── How It Works ────────────────────────────────────────── */}
      <section className="mb-20">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">How it works</h2>
          <p className="mt-2 text-[var(--color-text-secondary)]">
            Get started in three simple steps.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          {[
            {
              step: '1',
              icon: ShieldCheckIcon,
              title: 'Create an Account',
              description: 'Sign up as a sponsor or publisher in seconds. No credit card required.',
            },
            {
              step: '2',
              icon: StorefrontIcon,
              title: 'Browse or List',
              description:
                'Sponsors browse the marketplace. Publishers list their ad slots with pricing.',
            },
            {
              step: '3',
              icon: LightningIcon,
              title: 'Launch & Grow',
              description: 'Book placements, launch campaigns, and track performance in real time.',
            },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary-subtle)] text-lg font-bold text-[var(--color-primary)]">
                {item.step}
              </div>
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA ─────────────────────────────────────────────────── */}
      <section className="card mb-12 p-12 text-center">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Ready to start?</h2>
        <p className="mx-auto mt-3 max-w-md text-[var(--color-text-secondary)]">
          Join thousands of sponsors and publishers already using Anvara to grow their business.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link href="/login" className="btn btn-primary btn-lg px-8">
            Get Started Free
            <ArrowRightIcon size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
