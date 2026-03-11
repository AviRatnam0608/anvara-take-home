'use client';

import { useActionState, useState, useEffect } from 'react';
import { createCampaignAction } from '../actions';
import { SubmitButton } from '@/app/components/submit-button';
import { PlusIcon } from '@phosphor-icons/react';
import type { ActionState } from '@/lib/types';

const initialState: ActionState = {};

export function CreateCampaignForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction] = useActionState(createCampaignAction, initialState);

  // Controlled form fields — persist values across validation failures
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Close modal and reset form on success
  useEffect(() => {
    if (state.success) {
      setIsOpen(false);
      setName('');
      setDescription('');
      setBudget('');
      setStartDate('');
      setEndDate('');
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
        <PlusIcon size={18} weight="bold" />
        Add Campaign
      </button>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="mb-4 text-lg font-bold text-[var(--color-text-primary)]">
          Create New Campaign
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
              htmlFor="campaign-name"
              className="form-label"
            >
              Name <span className="text-[var(--color-error)]">*</span>
            </label>
            <input
              id="campaign-name"
              name="name"
              type="text"
              placeholder="e.g. Summer Sale 2025"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={state.fieldErrors?.name ? 'border-[var(--color-error)]' : ''}
            />
            {state.fieldErrors?.name && (
              <p className="form-error-text">{state.fieldErrors.name}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="campaign-description"
              className="form-label"
            >
              Description
            </label>
            <textarea
              id="campaign-description"
              name="description"
              placeholder="Optional campaign description"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Budget */}
          <div>
            <label
              htmlFor="campaign-budget"
              className="form-label"
            >
              Budget ($) <span className="text-[var(--color-error)]">*</span>
            </label>
            <input
              id="campaign-budget"
              name="budget"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="e.g. 10000"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className={state.fieldErrors?.budget ? 'border-[var(--color-error)]' : ''}
            />
            {state.fieldErrors?.budget && (
              <p className="form-error-text">{state.fieldErrors.budget}</p>
            )}
          </div>

          {/* Start Date */}
          <div>
            <label
              htmlFor="campaign-startDate"
              className="form-label"
            >
              Start Date <span className="text-[var(--color-error)]">*</span>
            </label>
            <input
              id="campaign-startDate"
              name="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={state.fieldErrors?.startDate ? 'border-[var(--color-error)]' : ''}
            />
            {state.fieldErrors?.startDate && (
              <p className="form-error-text">{state.fieldErrors.startDate}</p>
            )}
          </div>

          {/* End Date */}
          <div>
            <label
              htmlFor="campaign-endDate"
              className="form-label"
            >
              End Date <span className="text-[var(--color-error)]">*</span>
            </label>
            <input
              id="campaign-endDate"
              name="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={state.fieldErrors?.endDate ? 'border-[var(--color-error)]' : ''}
            />
            {state.fieldErrors?.endDate && (
              <p className="form-error-text">{state.fieldErrors.endDate}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <SubmitButton pendingText="Creating...">Create Campaign</SubmitButton>
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
