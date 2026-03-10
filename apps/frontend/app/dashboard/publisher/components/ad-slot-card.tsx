'use client';

import { useState } from 'react';
import type { AdSlot } from '@/lib/types';
import { PencilSimple } from '@phosphor-icons/react';
import { EditAdSlotForm } from './edit-ad-slot-form';
import { DeleteAdSlotButton } from './delete-ad-slot-button';

interface AdSlotCardProps {
  adSlot: AdSlot;
}

const typeColors: Record<string, string> = {
  DISPLAY: 'bg-[--color-primary-subtle] text-[--color-primary]',
  VIDEO: 'bg-[--color-error-subtle] text-[--color-error]',
  NATIVE: 'bg-[--color-success-subtle] text-[--color-success]',
  NEWSLETTER: 'bg-[--color-secondary-subtle] text-[--color-secondary]',
  PODCAST: 'bg-[--color-warning-subtle] text-[--color-warning]',
};

export function AdSlotCard({ adSlot }: AdSlotCardProps) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <>
      <div className="rounded-2xl border border-[--color-border] bg-[--color-bg-raised] p-6 transition-all duration-200 hover:border-[--color-border-hover]">
        <div className="mb-3 flex items-start justify-between gap-3">
          <h3 className="font-semibold text-[--color-text-primary]">{adSlot.name}</h3>
          <span
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${typeColors[adSlot.type] || 'bg-[--color-bg-input] text-[--color-text-muted]'}`}
          >
            {adSlot.type}
          </span>
        </div>

        {adSlot.description && (
          <p className="mb-4 text-sm leading-relaxed text-[--color-text-secondary] line-clamp-2">
            {adSlot.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-sm font-medium">
            <span
              className={`inline-block h-2 w-2 rounded-full ${adSlot.isAvailable ? 'bg-[--color-success]' : 'bg-[--color-text-muted]'}`}
              aria-hidden="true"
            />
            <span
              className={
                adSlot.isAvailable ? 'text-[--color-success]' : 'text-[--color-text-muted]'
              }
            >
              {adSlot.isAvailable ? 'Available' : 'Booked'}
            </span>
          </span>
          <span className="text-lg font-bold text-[--color-primary]">
            ${Number(adSlot.basePrice).toLocaleString()}/mo
          </span>
        </div>

        {/* Edit / Delete actions */}
        <div className="mt-4 flex items-center gap-2 border-t border-[--color-border] pt-4">
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex min-h-[44px] cursor-pointer items-center gap-1.5 rounded-[--radius-sm] px-3 py-2 text-sm font-medium text-[--color-primary] transition-colors hover:bg-[--color-primary-subtle]"
          >
            <PencilSimple size={16} />
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
