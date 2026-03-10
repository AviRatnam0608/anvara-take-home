'use client';

import { useActionState, useState, useEffect } from 'react';
import { createCampaignAction } from '../actions';
import { SubmitButton } from '@/app/components/submit-button';
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
        className="cursor-pointer rounded-lg bg-[--color-primary] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
      >
        Add Campaign
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg border border-[--color-border] bg-white p-6 text-black shadow-lg">
        <h2 className="mb-4 text-lg font-bold">Create New Campaign</h2>

        {state.error && (
          <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-4">
          {/* Name */}
          <div>
            <label htmlFor="campaign-name" className="block text-sm font-medium text-[--color-foreground]">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              id="campaign-name"
              name="name"
              type="text"
              placeholder="e.g. Summer Sale 2025"
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
            <label htmlFor="campaign-description" className="block text-sm font-medium text-[--color-foreground]">
              Description
            </label>
            <textarea
              id="campaign-description"
              name="description"
              placeholder="Optional campaign description"
              rows={2}
              className="mt-1 w-full rounded border border-[--color-border] px-3 py-2 text-gray-900"
            />
          </div>

          {/* Budget */}
          <div>
            <label htmlFor="campaign-budget" className="block text-sm font-medium text-[--color-foreground]">
              Budget ($) <span className="text-red-500">*</span>
            </label>
            <input
              id="campaign-budget"
              name="budget"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="e.g. 10000"
              className={`mt-1 w-full rounded border px-3 py-2 text-gray-900 ${
                state.fieldErrors?.budget ? 'border-red-400' : 'border-[--color-border]'
              }`}
            />
            {state.fieldErrors?.budget && (
              <p className="mt-1 text-xs text-red-500">{state.fieldErrors.budget}</p>
            )}
          </div>

          {/* Start Date */}
          <div>
            <label htmlFor="campaign-startDate" className="block text-sm font-medium text-[--color-foreground]">
              Start Date <span className="text-red-500">*</span>
            </label>
            <input
              id="campaign-startDate"
              name="startDate"
              type="date"
              className={`mt-1 w-full rounded border px-3 py-2 text-gray-900 ${
                state.fieldErrors?.startDate ? 'border-red-400' : 'border-[--color-border]'
              }`}
            />
            {state.fieldErrors?.startDate && (
              <p className="mt-1 text-xs text-red-500">{state.fieldErrors.startDate}</p>
            )}
          </div>

          {/* End Date */}
          <div>
            <label htmlFor="campaign-endDate" className="block text-sm font-medium text-[--color-foreground]">
              End Date <span className="text-red-500">*</span>
            </label>
            <input
              id="campaign-endDate"
              name="endDate"
              type="date"
              className={`mt-1 w-full rounded border px-3 py-2 text-gray-900 ${
                state.fieldErrors?.endDate ? 'border-red-400' : 'border-[--color-border]'
              }`}
            />
            {state.fieldErrors?.endDate && (
              <p className="mt-1 text-xs text-red-500">{state.fieldErrors.endDate}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <SubmitButton pendingText="Creating...">Create Campaign</SubmitButton>
            <button
              type="button"
              onClick={handleCancel}
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
