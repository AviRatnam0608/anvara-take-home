import Link from 'next/link';
import { headers } from 'next/headers';
import { auth } from '@/auth';
import { getUserRole } from '@/lib/auth-helpers';
import { Hexagon } from '@phosphor-icons/react/dist/ssr';
import { LogoutButton } from './logout-button';
import { MobileNav } from './mobile-nav';

export async function Nav() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const user = session?.user;
  let role: 'sponsor' | 'publisher' | null = null;

  if (user?.id) {
    const roleData = await getUserRole(user.id);
    role = roleData.role;
  }

  return (
    <header className="glass sticky top-0 z-40">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-[--color-primary]">
          <Hexagon size={28} weight="duotone" />
          Anvara
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-1 md:flex">
          <Link
            href="/marketplace"
            className="rounded-[--radius-sm] px-4 py-2 text-sm font-medium text-[--color-text-secondary] transition-colors hover:bg-[--color-glass-bg] hover:text-[--color-text-primary]"
          >
            Marketplace
          </Link>

          {user && role === 'sponsor' && (
            <Link
              href="/dashboard/sponsor"
              className="rounded-[--radius-sm] px-4 py-2 text-sm font-medium text-[--color-text-secondary] transition-colors hover:bg-[--color-glass-bg] hover:text-[--color-text-primary]"
            >
              My Campaigns
            </Link>
          )}
          {user && role === 'publisher' && (
            <Link
              href="/dashboard/publisher"
              className="rounded-[--radius-sm] px-4 py-2 text-sm font-medium text-[--color-text-secondary] transition-colors hover:bg-[--color-glass-bg] hover:text-[--color-text-primary]"
            >
              My Ad Slots
            </Link>
          )}

          <div className="ml-3 border-l border-[--color-border] pl-4">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-[--color-text-secondary]">{user.name}</span>
                {role && (
                  <span className="rounded-full bg-[--color-primary-subtle] px-2.5 py-0.5 text-xs font-medium text-[--color-primary]">
                    {role}
                  </span>
                )}
                <LogoutButton />
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex min-h-[36px] items-center rounded-[--radius-md] bg-[--color-primary] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[--color-primary-hover]"
              >
                Login
              </Link>
            )}
          </div>
        </div>

        {/* Mobile hamburger */}
        <MobileNav user={user ? { name: user.name ?? '' } : null} role={role} />
      </nav>
    </header>
  );
}
