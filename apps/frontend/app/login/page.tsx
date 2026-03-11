'use client';

import React from 'react';
import { useState } from 'react';
import { authClient } from '@/auth-client';
import { MegaphoneIcon, LayoutIcon, CircleNotchIcon, UserIcon } from '@phosphor-icons/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4291';

export default function LoginPage() {
  const [role, setRole] = useState<'sponsor' | 'publisher'>('sponsor');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const email = role === 'sponsor' ? 'sponsor@example.com' : 'publisher@example.com';
  const password = 'password';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: signInError } = await authClient.signIn.email(
      { email, password },
      {
        onRequest: () => {
          setLoading(true);
        },
        onSuccess: async (ctx) => {
          try {
            const userId = ctx.data?.user?.id;
            if (userId) {
              const roleRes = await fetch(`${API_URL}/api/auth/role/${userId}`);
              const roleData = await roleRes.json();
              if (roleData.role === 'sponsor') {
                window.location.href = '/dashboard/sponsor';
              } else if (roleData.role === 'publisher') {
                window.location.href = '/dashboard/publisher';
              } else {
                window.location.href = '/';
              }
            } else {
              window.location.href = '/';
            }
          } catch {
            window.location.href = '/';
          }
        },
        onError: (ctx) => {
          setError(ctx.error.message || 'Login failed');
          setLoading(false);
        },
      }
    );

    if (signInError) {
      setError(signInError.message || 'Login failed');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-md auth-card">
        {/* Header */}
        <div className="mb-8 text-center">
          <UserIcon size={48} weight="duotone" className="mx-auto mb-3 text-[var(--color-primary)]" />
          <h1 className="text-2xl font-bold">Login to Anvara</h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Select a role to continue</p>
        </div>

        {error && (
          <div className="alert-error mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Role selector cards */}
          <fieldset>
            <legend className="mb-3 text-sm font-medium text-[var(--color-text-secondary)]">
              Login as
            </legend>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('sponsor')}
                className={`flex flex-col items-center gap-2 rounded-[var(--radius-lg)] border-2 p-5 text-center transition-all ${
                  role === 'sponsor'
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary-subtle)]'
                    : 'border-[var(--color-border)] bg-[var(--color-bg-input)] hover:border-[var(--color-border-hover)]'
                }`}
                aria-pressed={role === 'sponsor'}
              >
                <MegaphoneIcon
                  size={28}
                  weight="duotone"
                  className={
                    role === 'sponsor' ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'
                  }
                />
                <span
                  className={`text-sm font-semibold ${role === 'sponsor' ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-primary)]'}`}
                >
                  Sponsor
                </span>
                <span className="text-xs text-[var(--color-text-muted)]">sponsor@example.com</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('publisher')}
                className={`flex flex-col items-center gap-2 rounded-[var(--radius-lg)] border-2 p-5 text-center transition-all ${
                  role === 'publisher'
                    ? 'border-[var(--color-secondary)] bg-[var(--color-secondary-subtle)]'
                    : 'border-[var(--color-border)] bg-[var(--color-bg-input)] hover:border-[var(--color-border-hover)]'
                }`}
                aria-pressed={role === 'publisher'}
              >
                <LayoutIcon
                  size={28}
                  weight="duotone"
                  className={
                    role === 'publisher' ? 'text-[var(--color-secondary)]' : 'text-[var(--color-text-muted)]'
                  }
                />
                <span
                  className={`text-sm font-semibold ${role === 'publisher' ? 'text-[var(--color-secondary)]' : 'text-[var(--color-text-primary)]'}`}
                >
                  Publisher
                </span>
                <span className="text-xs text-[var(--color-text-muted)]">publisher@example.com</span>
              </button>
            </div>
          </fieldset>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-lg btn-block disabled:opacity-50"
          >
            {loading ? (
              <>
                <CircleNotchIcon size={18} weight="bold" className="animate-spin" />
                Logging in...
              </>
            ) : (
              `Login as ${role === 'sponsor' ? 'Sponsor' : 'Publisher'}`
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
