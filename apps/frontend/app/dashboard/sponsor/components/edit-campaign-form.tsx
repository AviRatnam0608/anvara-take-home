'use client';

import { useActionState, useState, useEffect } from 'react';
import { updateCampaignAction } from '../actions';
import { SubmitButton } from '@/app/components/submit-button';
import type { ActionState, Campaign } from '@/lib/types';

const CAMPAIGN_STATUSES: Campaign['status'][] = ['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED'];

const initialState: ActionState = {};

interface EditCampaignFormProps {
  campaign: Campaign;
  onClose: () => void;
}

/** Format an ISO date string to YYYY-MM-DD for <input type="date"> */
function toDateInput(isoString: string): string {
  return new Date(isoString).toISOString().split('T')[0];
}

export function EditCampaignForm({ campaign, onClose }: EditCampaignFormProps) {
  const [state, formAction] = useActionState(updateCampaignAction, initialState);

  // Close modal on success
  useEffect(() => {
    if (state.success) {
      onClose();
    }
  }, [state, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg border border-[--color-border] bg-white p-6 text-black shadow-lg">
        <h2 className="mb-4 text-lg font-bold">Edit Campaign</h2>

        {state.error && (
          <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="id" value={campaign.id} />

          {/* Name */}
          <div>
            <label
              htmlFor="edit-campaign-name"
              className="block text-sm font-medium text-[--color-foreground]"
            >
              Name <span className="text-red-500">*</span>
            </label>
            <input
              id="edit-campaign-name"
              name="name"
              type="text"
              defaultValue={campaign.name}
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
            <label
              htmlFor="edit-campaign-description"
              className="block text-sm font-medium text-[--color-foreground]"
            >
              Description
            </label>
            <textarea
              id="edit-campaign-description"
              name="description"
              defaultValue={campaign.description ?? ''}
              rows={2}
              className="mt-1 w-full rounded border border-[--color-border] px-3 py-2 text-gray-900"
            />
          </div>

          {/* Budget */}
          <div>
            <label
              htmlFor="edit-campaign-budget"
              className="block text-sm font-medium text-[--color-foreground]"
            >
              Budget ($) <span className="text-red-500">*</span>
            </label>
            <input
              id="edit-campaign-budget"
              name="budget"
              type="number"
              min="0.01"
              step="0.01"
              defaultValue={campaign.budget}
              className={`mt-1 w-full rounded border px-3 py-2 text-gray-900 ${
                state.fieldErrors?.budget ? 'border-red-400' : 'border-[--color-border]'
              }`}
            />
            {state.fieldErrors?.budget && (
              <p className="mt-1 text-xs text-red-500">{state.fieldErrors.budget}</p>
            )}
          </div>

          {/* Status */}
          <div>
            <label
              htmlFor="edit-campaign-status"
              className="block text-sm font-medium text-[--color-foreground]"
            >
              Status
            </label>
            <select
              id="edit-campaign-status"
              name="status"
              defaultValue={campaign.status}
              className={`mt-1 w-full rounded border bg-white px-3 py-2 text-gray-900 ${
                state.fieldErrors?.status ? 'border-red-400' : 'border-[--color-border]'
              }`}
            >
              {CAMPAIGN_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0) + s.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
            {state.fieldErrors?.status && (
              <p className="mt-1 text-xs text-red-500">{state.fieldErrors.status}</p>
            )}
          </div>

          {/* Start Date */}
          <div>
            <label
              htmlFor="edit-campaign-startDate"
              className="block text-sm font-medium text-[--color-foreground]"
            >
              Start Date <span className="text-red-500">*</span>
            </label>
            <input
              id="edit-campaign-startDate"
              name="startDate"
              type="date"
              defaultValue={toDateInput(campaign.startDate)}
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
            <label
              htmlFor="edit-campaign-endDate"
              className="block text-sm font-medium text-[--color-foreground]"
            >
              End Date <span className="text-red-500">*</span>
            </label>
            <input
              id="edit-campaign-endDate"
              name="endDate"
              type="date"
              defaultValue={toDateInput(campaign.endDate)}
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
