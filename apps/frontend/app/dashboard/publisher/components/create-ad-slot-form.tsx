'use client';

import { useActionState, useState } from 'react';
import { createAdSlotAction } from '../actions';
import { SubmitButton } from '@/app/components/submit-button';
import { PlusIcon } from '@phosphor-icons/react';
import type { ActionState, AdSlot } from '@/lib/types';
import { formatCurrency, parseCurrency } from '@/lib/utils';

const AD_SLOT_TYPES: AdSlot['type'][] = ['DISPLAY', 'VIDEO', 'NATIVE', 'NEWSLETTER', 'PODCAST'];

const initialState: ActionState = {};

export function CreateAdSlotForm() {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button onClick={() => setIsOpen(true)} className="btn btn-primary btn-md cursor-pointer">
        <PlusIcon size={18} weight="bold" />
        Add Ad Slot
      </button>
    );
  }

  return <CreateAdSlotModal onClose={() => setIsOpen(false)} />;
}

function CreateAdSlotModal({ onClose }: { onClose: () => void }) {
  const [state, formAction] = useActionState(
    async (prevState: ActionState, formData: FormData) => {
      const result = await createAdSlotAction(prevState, formData);
      if (result.success) onClose();
      return result;
    },
    initialState,
  );

  // Controlled form fields — persist values across validation failures
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('');
  const [basePrice, setBasePrice] = useState('');

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="mb-4 text-lg font-bold text-[var(--color-text-primary)]">
          Create New Ad Slot
        </h2>

        {state.error && (
          <div className="alert-error mb-4 rounded-[var(--radius-sm)] p-3">{state.error}</div>
        )}

        <form action={formAction} className="space-y-4">
          {/* Name */}
          <div>
            <label htmlFor="create-name" className="form-label">
              Name <span className="text-[var(--color-error)]">*</span>
            </label>
            <input
              id="create-name"
              name="name"
              type="text"
              placeholder="e.g. Header Banner"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={state.fieldErrors?.name ? 'border-[var(--color-error)]' : ''}
            />
            {state.fieldErrors?.name && <p className="form-error-text">{state.fieldErrors.name}</p>}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="create-description" className="form-label">
              Description
            </label>
            <textarea
              id="create-description"
              name="description"
              placeholder="Optional description of the ad slot"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Type */}
          <div>
            <label htmlFor="create-type" className="form-label">
              Type <span className="text-[var(--color-error)]">*</span>
            </label>
            <select
              id="create-type"
              name="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className={state.fieldErrors?.type ? 'border-[var(--color-error)]' : ''}
            >
              <option value="">Select a type...</option>
              {AD_SLOT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.charAt(0) + t.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
            {state.fieldErrors?.type && <p className="form-error-text">{state.fieldErrors.type}</p>}
          </div>

          {/* Base Price */}
          <div>
            <label htmlFor="create-basePrice" className="form-label">
              Base Price ($/mo) <span className="text-[var(--color-error)]">*</span>
            </label>
            <input
              id="create-basePrice"
              name="basePrice"
              type="text"
              placeholder="e.g. 10000"
              value={basePrice}
              onChange={(e) => setBasePrice(parseCurrency(e.target.value))}
              onFocus={(e) => setBasePrice(parseCurrency(e.target.value))}
              onBlur={(e) => setBasePrice(formatCurrency(e.target.value))}
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
