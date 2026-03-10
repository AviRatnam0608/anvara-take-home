'use client';

import { useActionState, useState, useEffect } from 'react';
import { createCampaignAction } from '../actions';
import { SubmitButton } from '@/app/components/submit-button';
import { Plus } from '@phosphor-icons/react';
import type { ActionState } from '@/lib/types';

const initialState: ActionState = {};

export function CreateCampaignForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction] = useActionState(createCampaignAction, initialState);

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
        Add Campaign
      </button>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content w-full max-w-md">
        <h2 className="mb-4 text-lg font-bold text-[--color-text-primary]">
          Create New Campaign
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
              htmlFor="campaign-name"
              className="mb-1 block text-sm font-medium text-[--color-text-secondary]"
            >
              Name <span className="text-[--color-error]">*</span>
            </label>
            <input
              id="campaign-name"
              name="name"
              type="text"
              placeholder="e.g. Summer Sale 2025"
              className={state.fieldErrors?.name ? 'border-[--color-error]' : ''}
            />
            {state.fieldErrors?.name && (
              <p className="mt-1 text-xs text-[--color-error]">{state.fieldErrors.name}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="campaign-description"
              className="mb-1 block text-sm font-medium text-[--color-text-secondary]"
            >
              Description
            </label>
            <textarea
              id="campaign-description"
              name="description"
              placeholder="Optional campaign description"
              rows={2}
            />
          </div>

          {/* Budget */}
          <div>
            <label
              htmlFor="campaign-budget"
              className="mb-1 block text-sm font-medium text-[--color-text-secondary]"
            >
              Budget ($) <span className="text-[--color-error]">*</span>
            </label>
            <input
              id="campaign-budget"
              name="budget"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="e.g. 10000"
              className={state.fieldErrors?.budget ? 'border-[--color-error]' : ''}
            />
            {state.fieldErrors?.budget && (
              <p className="mt-1 text-xs text-[--color-error]">{state.fieldErrors.budget}</p>
            )}
          </div>

          {/* Start Date */}
          <div>
            <label
              htmlFor="campaign-startDate"
              className="mb-1 block text-sm font-medium text-[--color-text-secondary]"
            >
              Start Date <span className="text-[--color-error]">*</span>
            </label>
            <input
              id="campaign-startDate"
              name="startDate"
              type="date"
              className={state.fieldErrors?.startDate ? 'border-[--color-error]' : ''}
            />
            {state.fieldErrors?.startDate && (
              <p className="mt-1 text-xs text-[--color-error]">{state.fieldErrors.startDate}</p>
            )}
          </div>

          {/* End Date */}
          <div>
            <label
              htmlFor="campaign-endDate"
              className="mb-1 block text-sm font-medium text-[--color-text-secondary]"
            >
              End Date <span className="text-[--color-error]">*</span>
            </label>
            <input
              id="campaign-endDate"
              name="endDate"
              type="date"
              className={state.fieldErrors?.endDate ? 'border-[--color-error]' : ''}
            />
            {state.fieldErrors?.endDate && (
              <p className="mt-1 text-xs text-[--color-error]">{state.fieldErrors.endDate}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <SubmitButton pendingText="Creating...">Create Campaign</SubmitButton>
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
