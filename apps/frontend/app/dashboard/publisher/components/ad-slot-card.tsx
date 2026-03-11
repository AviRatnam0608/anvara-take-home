'use client';

import { useState } from 'react';
import type { AdSlot } from '@/lib/types';
import { PencilSimpleIcon } from '@phosphor-icons/react';
import { EditAdSlotForm } from './edit-ad-slot-form';
import { DeleteAdSlotButton } from './delete-ad-slot-button';

interface AdSlotCardProps {
  adSlot: AdSlot;
}

const typeColors: Record<string, string> = {
  DISPLAY: 'bg-[var(--color-primary-subtle)] text-[var(--color-primary)]',
  VIDEO: 'bg-[var(--color-error-subtle)] text-[var(--color-error)]',
  NATIVE: 'bg-[var(--color-success-subtle)] text-[var(--color-success)]',
  NEWSLETTER: 'bg-[var(--color-secondary-subtle)] text-[var(--color-secondary)]',
  PODCAST: 'bg-[var(--color-warning-subtle)] text-[var(--color-warning)]',
};

export function AdSlotCard({ adSlot }: AdSlotCardProps) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <>
      <div className="card">
        <div className="mb-3 flex items-start justify-between gap-3">
          <h3 className="font-semibold text-[var(--color-text-primary)]">{adSlot.name}</h3>
          <span
            className={`badge ${typeColors[adSlot.type] || 'bg-[var(--color-bg-input)] text-[var(--color-text-muted)]'}`}
          >
            {adSlot.type}
          </span>
        </div>

        {adSlot.description && (
          <p className="mb-4 text-sm leading-relaxed text-[var(--color-text-secondary)] line-clamp-2">
            {adSlot.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-sm font-medium">
            <span
              className={`inline-block h-2 w-2 rounded-full ${adSlot.isAvailable ? 'bg-[var(--color-success)]' : 'bg-[var(--color-text-muted)]'}`}
              aria-hidden="true"
            />
            <span
              className={
                adSlot.isAvailable ? 'text-[var(--color-success)]' : 'text-[var(--color-text-muted)]'
              }
            >
              {adSlot.isAvailable ? 'Available' : 'Booked'}
            </span>
          </span>
          <span className="text-lg font-bold text-[var(--color-primary)]">
            ${Number(adSlot.basePrice).toLocaleString()}/mo
          </span>
        </div>

        {/* Edit / Delete actions */}
        <div className="mt-4 flex items-center gap-2 border-t border-[var(--color-border)] pt-4">
          <button
            onClick={() => setIsEditing(true)}
            className="btn btn-md cursor-pointer gap-1.5 rounded-[var(--radius-sm)] px-3 text-[var(--color-primary)] hover:bg-[var(--color-primary-subtle)]"
          >
            <PencilSimpleIcon size={16} />
            Edit
          </button>
          <DeleteAdSlotButton adSlotId={adSlot.id} adSlotName={adSlot.name} />
        </div>
      </div>

      {isEditing && (
        <EditAdSlotForm adSlot={adSlot} onClose={() => setIsEditing(false)} />
      )}
    </>
  );
}
