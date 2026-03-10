'use client';

import { authClient } from '@/auth-client';

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
      className="rounded bg-gray-600 px-3 py-1.5 text-sm text-white hover:bg-gray-500"
    >
      Logout
    </button>
  );
}
