'use client';

import { useActionState, useState, useEffect } from 'react';
import { updateAdSlotAction } from '../actions';
import { SubmitButton } from '@/app/components/submit-button';
import type { ActionState, AdSlot } from '@/lib/types';

const AD_SLOT_TYPES: AdSlot['type'][] = ['DISPLAY', 'VIDEO', 'NATIVE', 'NEWSLETTER', 'PODCAST'];

const initialState: ActionState = {};

interface EditAdSlotFormProps {
  adSlot: AdSlot;
  onClose: () => void;
}

export function EditAdSlotForm({ adSlot, onClose }: EditAdSlotFormProps) {
  const [state, formAction] = useActionState(updateAdSlotAction, initialState);

  // Close modal on success
  useEffect(() => {
    if (state.success) {
      onClose();
    }
  }, [state, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg border border-[--color-border] bg-white p-6 text-black shadow-lg">
        <h2 className="mb-4 text-lg font-bold">Edit Ad Slot</h2>

        {state.error && (
          <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="id" value={adSlot.id} />

          {/* Name */}
          <div>
            <label htmlFor="edit-name" className="block text-sm font-medium text-[--color-foreground]">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              id="edit-name"
              name="name"
              type="text"
              defaultValue={adSlot.name}
              className={`mt-1 w-full rounded border px-3 py-2 text-gray-900 ${
                state.fieldErrors?.name ? 'border-red-400' : 'border-[--color-border]'
              }`}
            />
            {state.fieldErrors?.name && (
              <p className="mt-1 text-xs text-red-500">{state.fieldErrors.name}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="edit-description" className="block text-sm font-medium text-[--color-foreground]">
              Description
            </label>
            <textarea
              id="edit-description"
              name="description"
              defaultValue={adSlot.description ?? ''}
              rows={2}
              className="mt-1 w-full rounded border border-[--color-border] px-3 py-2 text-gray-900"
            />
          </div>

          {/* Type */}
          <div>
            <label htmlFor="edit-type" className="block text-sm font-medium text-[--color-foreground]">
              Type <span className="text-red-500">*</span>
            </label>
            <select
              id="edit-type"
              name="type"
              defaultValue={adSlot.type}
              className={`mt-1 w-full rounded border bg-white px-3 py-2 text-gray-900 ${
                state.fieldErrors?.type ? 'border-red-400' : 'border-[--color-border]'
              }`}
            >
              <option value="">Select a type...</option>
              {AD_SLOT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.charAt(0) + t.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
            {state.fieldErrors?.type && (
              <p className="mt-1 text-xs text-red-500">{state.fieldErrors.type}</p>
            )}
          </div>

          {/* Base Price */}
          <div>
            <label htmlFor="edit-basePrice" className="block text-sm font-medium text-[--color-foreground]">
              Base Price ($/mo) <span className="text-red-500">*</span>
            </label>
            <input
              id="edit-basePrice"
              name="basePrice"
              type="number"
              min="0.01"
              step="0.01"
              defaultValue={adSlot.basePrice}
              className={`mt-1 w-full rounded border px-3 py-2 text-gray-900 ${
                state.fieldErrors?.basePrice ? 'border-red-400' : 'border-[--color-border]'
              }`}
            />
            {state.fieldErrors?.basePrice && (
              <p className="mt-1 text-xs text-red-500">{state.fieldErrors.basePrice}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <SubmitButton pendingText="Saving...">Save Changes</SubmitButton>
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-lg border border-[--color-border] px-4 py-2 font-semibold text-[--color-foreground] hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
