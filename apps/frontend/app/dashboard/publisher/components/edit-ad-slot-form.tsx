'use client';

import { useActionState, useEffect } from 'react';
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
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="mb-4 text-lg font-bold text-[--color-text-primary]">Edit Ad Slot</h2>

        {state.error && (
          <div className="alert-error mb-4 rounded-[--radius-sm] p-3">
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="id" value={adSlot.id} />

          {/* Name */}
          <div>
            <label
              htmlFor="edit-name"
              className="form-label"
            >
              Name <span className="text-[--color-error]">*</span>
            </label>
            <input
              id="edit-name"
              name="name"
              type="text"
              defaultValue={adSlot.name}
              className={state.fieldErrors?.name ? 'border-[--color-error]' : ''}
            />
            {state.fieldErrors?.name && (
              <p className="form-error-text">{state.fieldErrors.name}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="edit-description"
              className="form-label"
            >
              Description
            </label>
            <textarea
              id="edit-description"
              name="description"
              defaultValue={adSlot.description ?? ''}
              rows={2}
            />
          </div>

          {/* Type */}
          <div>
            <label
              htmlFor="edit-type"
              className="form-label"
            >
              Type <span className="text-[--color-error]">*</span>
            </label>
            <select
              id="edit-type"
              name="type"
              defaultValue={adSlot.type}
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
              <p className="form-error-text">{state.fieldErrors.type}</p>
            )}
          </div>

          {/* Base Price */}
          <div>
            <label
              htmlFor="edit-basePrice"
              className="form-label"
            >
              Base Price ($/mo) <span className="text-[--color-error]">*</span>
            </label>
            <input
              id="edit-basePrice"
              name="basePrice"
              type="number"
              min="0.01"
              step="0.01"
              defaultValue={adSlot.basePrice}
              className={state.fieldErrors?.basePrice ? 'border-[--color-error]' : ''}
            />
            {state.fieldErrors?.basePrice && (
              <p className="form-error-text">{state.fieldErrors.basePrice}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <SubmitButton pendingText="Saving...">Save Changes</SubmitButton>
            <button
              type="button"
              onClick={onClose}
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
