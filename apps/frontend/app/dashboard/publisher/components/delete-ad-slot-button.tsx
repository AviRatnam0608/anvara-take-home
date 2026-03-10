'use client';

import { useActionState, useEffect } from 'react';
import { deleteAdSlotAction } from '../actions';
import { SubmitButton } from '@/app/components/submit-button';
import type { ActionState } from '@/lib/types';

const initialState: ActionState = {};

interface DeleteAdSlotButtonProps {
  adSlotId: string;
  adSlotName: string;
}

export function DeleteAdSlotButton({ adSlotId, adSlotName }: DeleteAdSlotButtonProps) {
  const [state, formAction] = useActionState(deleteAdSlotAction, initialState);

  // Show error if delete fails (alert is fine for transient errors)
  useEffect(() => {
    if (state.error) {
      alert(`Failed to delete: ${state.error}`);
    }
  }, [state]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (!window.confirm(`Delete "${adSlotName}"? This cannot be undone.`)) {
      e.preventDefault();
    }
  }

  return (
    <form action={formAction} onSubmit={handleSubmit}>
      <input type="hidden" name="id" value={adSlotId} />
      <SubmitButton
        pendingText="Deleting..."
        className="cursor-pointer rounded px-3 py-1 text-sm text-red-600 hover:bg-red-50"
      >
        Delete
      </SubmitButton>
    </form>
  );
}
