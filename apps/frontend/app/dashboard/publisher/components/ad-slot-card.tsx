'use client';

import { useState } from 'react';
import type { AdSlot } from '@/lib/types';
import { EditAdSlotForm } from './edit-ad-slot-form';
import { DeleteAdSlotButton } from './delete-ad-slot-button';

interface AdSlotCardProps {
  adSlot: AdSlot;
}

const typeColors: Record<string, string> = {
  DISPLAY: 'bg-blue-100 text-blue-700',
  VIDEO: 'bg-red-100 text-red-700',
  NATIVE: 'bg-green-100 text-green-700',
  NEWSLETTER: 'bg-purple-100 text-purple-700',
  PODCAST: 'bg-orange-100 text-orange-700',
};

export function AdSlotCard({ adSlot }: AdSlotCardProps) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <>
      <div className="rounded-lg border border-[--color-border] p-4">
        <div className="mb-2 flex items-start justify-between">
          <h3 className="font-semibold">{adSlot.name}</h3>
          <span className={`rounded px-2 py-0.5 text-xs ${typeColors[adSlot.type] || 'bg-gray-100'}`}>
            {adSlot.type}
          </span>
        </div>

        {adSlot.description && (
          <p className="mb-3 text-sm text-[--color-muted] line-clamp-2">{adSlot.description}</p>
        )}

        <div className="flex items-center justify-between">
          <span
            className={`text-sm ${adSlot.isAvailable ? 'text-green-600' : 'text-[--color-muted]'}`}
          >
            {adSlot.isAvailable ? 'Available' : 'Booked'}
          </span>
          <span className="font-semibold text-[--color-primary]">
            ${Number(adSlot.basePrice).toLocaleString()}/mo
          </span>
        </div>

        {/* Edit / Delete actions */}
        <div className="mt-3 flex items-center gap-2 border-t border-[--color-border] pt-3">
          <button
            onClick={() => setIsEditing(true)}
            className="cursor-pointer rounded px-3 py-1 text-sm text-[--color-primary] hover:bg-blue-50"
          >
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
