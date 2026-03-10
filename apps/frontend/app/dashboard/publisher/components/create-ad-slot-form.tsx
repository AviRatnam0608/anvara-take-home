'use client';

import { useActionState, useState, useEffect } from 'react';
import { createAdSlotAction } from '../actions';
import { SubmitButton } from '@/app/components/submit-button';
import { Plus } from '@phosphor-icons/react';
import type { ActionState, AdSlot } from '@/lib/types';

const AD_SLOT_TYPES: AdSlot['type'][] = ['DISPLAY', 'VIDEO', 'NATIVE', 'NEWSLETTER', 'PODCAST'];

const initialState: ActionState = {};

export function CreateAdSlotForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction] = useActionState(createAdSlotAction, initialState);

  // Close modal on success
  useEffect(() => {
    if (state.success) {
      setIsOpen(false);
    }
  }, [state]);

  function handleCancel() {
    setIsOpen(false);
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-[--radius-md] bg-[--color-primary] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[--color-primary-hover]"
      >
        <Plus size={18} weight="bold" />
        Add Ad Slot
      </button>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content w-full max-w-md">
        <h2 className="mb-4 text-lg font-bold text-[--color-text-primary]">
          Create New Ad Slot
        </h2>

        {state.error && (
          <div className="mb-4 rounded-[--radius-sm] border border-[--color-error]/20 bg-[--color-error-subtle] p-3 text-sm text-[--color-error]">
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-4">
          {/* Name */}
          <div>
            <label
              htmlFor="create-name"
              className="mb-1 block text-sm font-medium text-[--color-text-secondary]"
            >
              Name <span className="text-[--color-error]">*</span>
            </label>
            <input
              id="create-name"
              name="name"
              type="text"
              placeholder="e.g. Header Banner"
              className={state.fieldErrors?.name ? 'border-[--color-error]' : ''}
            />
            {state.fieldErrors?.name && (
              <p className="mt-1 text-xs text-[--color-error]">{state.fieldErrors.name}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="create-description"
              className="mb-1 block text-sm font-medium text-[--color-text-secondary]"
            >
              Description
            </label>
            <textarea
              id="create-description"
              name="description"
              placeholder="Optional description of the ad slot"
              rows={2}
            />
          </div>

          {/* Type */}
          <div>
            <label
              htmlFor="create-type"
              className="mb-1 block text-sm font-medium text-[--color-text-secondary]"
            >
              Type <span className="text-[--color-error]">*</span>
            </label>
            <select
              id="create-type"
              name="type"
              className={state.fieldErrors?.type ? 'border-[--color-error]' : ''}
            >
              <option value="">Select a type...</option>
              {AD_SLOT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.charAt(0) + t.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
            {state.fieldErrors?.type && (
              <p className="mt-1 text-xs text-[--color-error]">{state.fieldErrors.type}</p>
            )}
          </div>

          {/* Base Price */}
          <div>
            <label
              htmlFor="create-basePrice"
              className="mb-1 block text-sm font-medium text-[--color-text-secondary]"
            >
              Base Price ($/mo) <span className="text-[--color-error]">*</span>
            </label>
            <input
              id="create-basePrice"
              name="basePrice"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="e.g. 500"
              className={state.fieldErrors?.basePrice ? 'border-[--color-error]' : ''}
            />
            {state.fieldErrors?.basePrice && (
              <p className="mt-1 text-xs text-[--color-error]">{state.fieldErrors.basePrice}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <SubmitButton pendingText="Creating...">Create Ad Slot</SubmitButton>
            <button
              type="button"
              onClick={handleCancel}
              className="min-h-[44px] cursor-pointer rounded-[--radius-md] border border-[--color-border] px-4 py-2 font-semibold text-[--color-text-secondary] transition-colors hover:bg-[--color-bg-input]"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
