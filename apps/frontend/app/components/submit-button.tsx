'use client';

import { useFormStatus } from 'react-dom';

interface SubmitButtonProps {
  /** Text shown normally, e.g. "Create Ad Slot" */
  children: React.ReactNode;
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
        'flex-1 cursor-pointer rounded-lg bg-[--color-primary] px-4 py-2 font-semibold text-black hover:opacity-90 disabled:opacity-50'
      }
    >
      {pending ? (pendingText ?? 'Saving...') : children}
    </button>
  );
}
