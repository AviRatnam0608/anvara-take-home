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
      <nav className="container-nav">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-[--color-primary]">
          <Hexagon size={28} weight="duotone" />
          Anvara
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-1 md:flex">
          <Link href="/marketplace" className="nav-link">
            Marketplace
          </Link>

          {user && role === 'sponsor' && (
            <Link href="/dashboard/sponsor" className="nav-link">
              My Campaigns
            </Link>
          )}
          {user && role === 'publisher' && (
            <Link href="/dashboard/publisher" className="nav-link">
              My Ad Slots
            </Link>
          )}

          <div className="ml-3 border-l border-[--color-border] pl-4">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-[--color-text-secondary]">{user.name}</span>
                {role && (
                  <span className="role-badge">
                    {role}
                  </span>
                )}
                <LogoutButton />
              </div>
            ) : (
              <Link
                href="/login"
                className="btn btn-primary btn-md"
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
