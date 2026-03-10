'use client';

import { useActionState, useEffect } from 'react';
import { deleteCampaignAction } from '../actions';
import { SubmitButton } from '@/app/components/submit-button';
import type { ActionState } from '@/lib/types';

const initialState: ActionState = {};

interface DeleteCampaignButtonProps {
  campaignId: string;
  campaignName: string;
}

export function DeleteCampaignButton({ campaignId, campaignName }: DeleteCampaignButtonProps) {
  const [state, formAction] = useActionState(deleteCampaignAction, initialState);

  // Show error if delete fails
  useEffect(() => {
    if (state.error) {
      alert(`Failed to delete: ${state.error}`);
    }
  }, [state]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (!window.confirm(`Delete "${campaignName}"? This cannot be undone.`)) {
      e.preventDefault();
    }
  }

  return (
    <form action={formAction} onSubmit={handleSubmit}>
      <input type="hidden" name="id" value={campaignId} />
      <SubmitButton
        pendingText="Deleting..."
        className="cursor-pointer rounded px-3 py-1 text-sm text-red-600 hover:bg-red-50"
      >
        Delete
      </SubmitButton>
    </form>
  );
}
