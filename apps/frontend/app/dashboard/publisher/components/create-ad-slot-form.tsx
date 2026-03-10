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
        className="btn btn-primary btn-md cursor-pointer"
      >
        <Plus size={18} weight="bold" />
        Add Ad Slot
      </button>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="mb-4 text-lg font-bold text-[var(--color-text-primary)]">
          Create New Ad Slot
        </h2>

        {state.error && (
          <div className="alert-error mb-4 rounded-[var(--radius-sm)] p-3">
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-4">
          {/* Name */}
          <div>
            <label
              htmlFor="create-name"
              className="form-label"
            >
              Name <span className="text-[var(--color-error)]">*</span>
            </label>
            <input
              id="create-name"
              name="name"
              type="text"
              placeholder="e.g. Header Banner"
              className={state.fieldErrors?.name ? 'border-[var(--color-error)]' : ''}
            />
            {state.fieldErrors?.name && (
              <p className="form-error-text">{state.fieldErrors.name}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="create-description"
              className="form-label"
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
              className="form-label"
            >
              Type <span className="text-[var(--color-error)]">*</span>
            </label>
            <select
              id="create-type"
              name="type"
              className={state.fieldErrors?.type ? 'border-[var(--color-error)]' : ''}
            >
              <option value="">Select a type...</option>
              {AD_SLOT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.charAt(0) + t.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
            {state.fieldErrors?.type && (
              <p className="form-error-text">{state.fieldErrors.type}</p>
            )}
          </div>

          {/* Base Price */}
          <div>
            <label
              htmlFor="create-basePrice"
              className="form-label"
            >
              Base Price ($/mo) <span className="text-[var(--color-error)]">*</span>
            </label>
            <input
              id="create-basePrice"
              name="basePrice"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="e.g. 500"
              className={state.fieldErrors?.basePrice ? 'border-[var(--color-error)]' : ''}
            />
            {state.fieldErrors?.basePrice && (
              <p className="form-error-text">{state.fieldErrors.basePrice}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <SubmitButton pendingText="Creating...">Create Ad Slot</SubmitButton>
            <button
              type="button"
              onClick={handleCancel}
              className="btn btn-secondary btn-md cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
