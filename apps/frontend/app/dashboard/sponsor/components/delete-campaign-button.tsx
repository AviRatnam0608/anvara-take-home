'use client';

import { useActionState, useEffect } from 'react';
import { deleteCampaignAction } from '../actions';
import { SubmitButton } from '@/app/components/submit-button';
import { TrashSimple } from '@phosphor-icons/react';
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

  function handleSubmit(e: { preventDefault: () => void }) {
    if (!window.confirm(`Delete "${campaignName}"? This cannot be undone.`)) {
      e.preventDefault();
    }
  }

  return (
    <form action={formAction} onSubmit={handleSubmit}>
      <input type="hidden" name="id" value={campaignId} />
      <SubmitButton
        pendingText="Deleting..."
        className="inline-flex min-h-[44px] cursor-pointer items-center gap-1.5 rounded-[--radius-sm] px-3 py-2 text-sm font-medium text-[--color-error] transition-colors hover:bg-[--color-error-subtle]"
      >
        <TrashSimple size={16} />
        Delete
      </SubmitButton>
    </form>
  );
}
