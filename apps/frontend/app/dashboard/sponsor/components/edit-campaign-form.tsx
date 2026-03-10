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
    <div className="modal-overlay">
      <div className="modal-content w-full max-w-md">
        <h2 className="mb-4 text-lg font-bold text-[--color-text-primary]">Edit Campaign</h2>

        {state.error && (
          <div className="mb-4 rounded-[--radius-sm] border border-[--color-error]/20 bg-[--color-error-subtle] p-3 text-sm text-[--color-error]">
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="id" value={campaign.id} />

          {/* Name */}
          <div>
            <label
              htmlFor="edit-campaign-name"
              className="mb-1 block text-sm font-medium text-[--color-text-secondary]"
            >
              Name <span className="text-[--color-error]">*</span>
            </label>
            <input
              id="edit-campaign-name"
              name="name"
              type="text"
              defaultValue={campaign.name}
              className={state.fieldErrors?.name ? 'border-[--color-error]' : ''}
            />
            {state.fieldErrors?.name && (
              <p className="mt-1 text-xs text-[--color-error]">{state.fieldErrors.name}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="edit-campaign-description"
              className="mb-1 block text-sm font-medium text-[--color-text-secondary]"
            >
              Description
            </label>
            <textarea
              id="edit-campaign-description"
              name="description"
              defaultValue={campaign.description ?? ''}
              rows={2}
            />
          </div>

          {/* Budget */}
          <div>
            <label
              htmlFor="edit-campaign-budget"
              className="mb-1 block text-sm font-medium text-[--color-text-secondary]"
            >
              Budget ($) <span className="text-[--color-error]">*</span>
            </label>
            <input
              id="edit-campaign-budget"
              name="budget"
              type="number"
              min="0.01"
              step="0.01"
              defaultValue={campaign.budget}
              className={state.fieldErrors?.budget ? 'border-[--color-error]' : ''}
            />
            {state.fieldErrors?.budget && (
              <p className="mt-1 text-xs text-[--color-error]">{state.fieldErrors.budget}</p>
            )}
          </div>

          {/* Status */}
          <div>
            <label
              htmlFor="edit-campaign-status"
              className="mb-1 block text-sm font-medium text-[--color-text-secondary]"
            >
              Status
            </label>
            <select
              id="edit-campaign-status"
              name="status"
              defaultValue={campaign.status}
              className={state.fieldErrors?.status ? 'border-[--color-error]' : ''}
            >
              {CAMPAIGN_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0) + s.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
            {state.fieldErrors?.status && (
              <p className="mt-1 text-xs text-[--color-error]">{state.fieldErrors.status}</p>
            )}
          </div>

          {/* Start Date */}
          <div>
            <label
              htmlFor="edit-campaign-startDate"
              className="mb-1 block text-sm font-medium text-[--color-text-secondary]"
            >
              Start Date <span className="text-[--color-error]">*</span>
            </label>
            <input
              id="edit-campaign-startDate"
              name="startDate"
              type="date"
              defaultValue={toDateInput(campaign.startDate)}
              className={state.fieldErrors?.startDate ? 'border-[--color-error]' : ''}
            />
            {state.fieldErrors?.startDate && (
              <p className="mt-1 text-xs text-[--color-error]">{state.fieldErrors.startDate}</p>
            )}
          </div>

          {/* End Date */}
          <div>
            <label
              htmlFor="edit-campaign-endDate"
              className="mb-1 block text-sm font-medium text-[--color-text-secondary]"
            >
              End Date <span className="text-[--color-error]">*</span>
            </label>
            <input
              id="edit-campaign-endDate"
              name="endDate"
              type="date"
              defaultValue={toDateInput(campaign.endDate)}
              className={state.fieldErrors?.endDate ? 'border-[--color-error]' : ''}
            />
            {state.fieldErrors?.endDate && (
              <p className="mt-1 text-xs text-[--color-error]">{state.fieldErrors.endDate}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <SubmitButton pendingText="Saving...">Save Changes</SubmitButton>
            <button
              type="button"
              onClick={onClose}
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
