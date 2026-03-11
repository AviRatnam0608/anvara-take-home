'use client';

import { authClient } from '@/auth-client';
import { SignOutIcon } from '@phosphor-icons/react';

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
      className="btn btn-ghost btn-md"
      aria-label="Sign out"
    >
      <SignOutIcon size={16} />
      Logout
    </button>
  );
}
