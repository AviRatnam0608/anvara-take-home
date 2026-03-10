'use client';

import { useActionState } from 'react';
import { unbookAdSlotAction } from '../actions';
import { SubmitButton } from '@/app/components/submit-button';
import type { ActionState } from '@/lib/types';

const initialState: ActionState = {};

interface UnbookButtonProps {
  adSlotId: string;
}

export function UnbookButton({ adSlotId }: UnbookButtonProps) {
  const [state, formAction] = useActionState(unbookAdSlotAction, initialState);

  return (
    <form action={formAction} className="inline">
      <input type="hidden" name="adSlotId" value={adSlotId} />
      {state.error && (
        <span className="mr-2 text-sm text-red-600">{state.error}</span>
      )}
      <SubmitButton
        pendingText="Resetting..."
        className="cursor-pointer text-sm text-[--color-primary] underline hover:opacity-80"
      >
        Reset listing
      </SubmitButton>
    </form>
  );
}
