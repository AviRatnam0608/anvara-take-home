'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ListIcon, XIcon, StorefrontIcon, MegaphoneIcon, LayoutIcon } from '@phosphor-icons/react';
import { LogoutButton } from './logout-button';

interface MobileNavProps {
  user: { name: string } | null;
  role: 'sponsor' | 'publisher' | null;
}

export function MobileNav({ user, role }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const prevPathname = useRef(pathname);

  // Close on route change (only when pathname actually changes)
  useEffect(() => {
    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname;
      setIsOpen(false);
    }
  }, [pathname]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <div className="md:hidden">
      {/* Hamburger button */}
      <button
        onClick={() => setIsOpen(true)}
        className="btn btn-ghost min-h-[44px] min-w-[44px] rounded-[var(--radius-sm)] justify-center"
        aria-label="Open menu"
        aria-expanded={isOpen}
      >
        <ListIcon size={28} />
      </button>

      {/* Overlay + Sidebar */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Sidebar */}
          <nav
            className="fixed right-0 top-0 z-50 flex h-full w-72 flex-col border-l border-[var(--color-border)] bg-[var(--color-bg-overlay)] p-6"
            style={{ animation: 'slideInFromRight 0.3s ease-out' }}
            role="dialog"
            aria-label="Mobile navigation"
          >
            {/* Close button */}
            <div className="mb-8 flex items-center justify-between">
              <span className="text-lg font-semibold text-[var(--color-text-primary)]">Menu</span>
              <button
                onClick={() => setIsOpen(false)}
                className="btn btn-ghost min-h-[44px] min-w-[44px] rounded-[var(--radius-sm)] justify-center"
                aria-label="Close menu"
              >
                <XIcon size={24} />
              </button>
            </div>

            {/* Links */}
            <div className="flex flex-1 flex-col gap-1">
              <Link
                href="/marketplace"
                className="btn btn-ghost w-full justify-start gap-3 rounded-[var(--radius-md)] px-4 py-3 text-base font-medium"
              >
                <StorefrontIcon size={20} />
                Marketplace
              </Link>

              {user && role === 'sponsor' && (
                <Link
                  href="/dashboard/sponsor"
                  className="btn btn-ghost w-full justify-start gap-3 rounded-[var(--radius-md)] px-4 py-3 text-base font-medium"
                >
                  <MegaphoneIcon size={20} />
                  My Campaigns
                </Link>
              )}

              {user && role === 'publisher' && (
                <Link
                  href="/dashboard/publisher"
                  className="btn btn-ghost w-full justify-start gap-3 rounded-[var(--radius-md)] px-4 py-3 text-base font-medium"
                >
                  <LayoutIcon size={20} />
                  My Ad Slots
                </Link>
              )}
            </div>

            {/* User section at bottom */}
            <div className="border-t border-[var(--color-border)] pt-4">
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[var(--color-text-primary)]">{user.name}</span>
                    {role && (
                      <span className="role-badge">
                        {role}
                      </span>
                    )}
                  </div>
                  <LogoutButton />
                </div>
              ) : (
                <Link
                  href="/login"
                  className="btn btn-primary btn-md min-h-[44px] rounded-[var(--radius-md)] px-5 py-2.5"
                >
                  Login
                </Link>
              )}
            </div>
          </nav>

          <style>{`
            @keyframes slideInFromRight {
              from { transform: translateX(100%); }
              to { transform: translateX(0); }
            }
          `}</style>
        </>
      )}
    </div>
  );
}
