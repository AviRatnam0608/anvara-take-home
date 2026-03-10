'use client';

import { useActionState, useEffect } from 'react';
import { deleteAdSlotAction } from '../actions';
import { SubmitButton } from '@/app/components/submit-button';
import { TrashSimple } from '@phosphor-icons/react';
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

  function handleSubmit(e: { preventDefault: () => void }) {
    if (!window.confirm(`Delete "${adSlotName}"? This cannot be undone.`)) {
      e.preventDefault();
    }
  }

  return (
    <form action={formAction} onSubmit={handleSubmit}>
      <input type="hidden" name="id" value={adSlotId} />
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
