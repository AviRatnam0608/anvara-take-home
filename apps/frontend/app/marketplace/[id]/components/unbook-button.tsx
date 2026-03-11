'use client';

import { useActionState } from 'react';
import { unbookAdSlotAction } from '../actions';
import { SubmitButton } from '@/app/components/submit-button';
import { ArrowCounterClockwiseIcon } from '@phosphor-icons/react';
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
        <span className="mr-2 text-sm text-[var(--color-error)]">{state.error}</span>
      )}
      <SubmitButton
        pendingText="Resetting..."
        className="inline-flex cursor-pointer items-center gap-1 text-sm text-[var(--color-primary)] underline transition-colors hover:text-[var(--color-primary-hover)]"
      >
        <ArrowCounterClockwiseIcon size={14} />
        Reset listing
      </SubmitButton>
    </form>
  );
}
