'use client';

import { authClient } from '@/auth-client';
import { SignOut } from '@phosphor-icons/react';

export function LogoutButton() {
  return (
    <button
      onClick={async () => {
        await authClient.signOut({
          fetchOptions: {
            onSuccess: () => {
              window.location.href = '/';
            },
          },
        });
      }}
      className="inline-flex min-h-[44px] items-center gap-2 rounded-[--radius-md] border border-[--color-border] px-4 py-2 text-sm font-medium text-[--color-text-secondary] transition-colors hover:bg-[--color-glass-bg] hover:text-[--color-text-primary]"
      aria-label="Sign out"
    >
      <SignOut size={16} />
      Logout
    </button>
  );
}
