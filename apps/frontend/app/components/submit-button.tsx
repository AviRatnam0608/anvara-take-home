'use client';

import { useFormStatus } from 'react-dom';
import { CircleNotch } from '@phosphor-icons/react';

import type { ReactNode } from 'react';

interface SubmitButtonProps {
  /** Text shown normally, e.g. "Create Ad Slot" */
  children: ReactNode;
  /** Text shown while the form is pending, e.g. "Creating..." */
  pendingText?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * A submit button that automatically shows a pending state via `useFormStatus`.
 * Must be rendered *inside* a `<form>` whose action is a Server Action.
 */
export function SubmitButton({ children, pendingText, className }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={
        className ??
        'btn btn-primary btn-md flex-1 cursor-pointer justify-center'
      }
    >
      {pending ? (
        <>
          <CircleNotch size={16} weight="bold" className="animate-spin" />
          {pendingText ?? 'Saving...'}
        </>
      ) : (
        children
      )}
    </button>
  );
}
