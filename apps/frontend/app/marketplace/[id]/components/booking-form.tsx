'use client';

import { useActionState } from 'react';
import { bookAdSlotAction } from '../actions';
import { unbookAdSlotAction } from '../actions';
import { SubmitButton } from '@/app/components/submit-button';
import type { ActionState } from '@/lib/types';

const initialState: ActionState = {};

interface BookingFormProps {
  adSlotId: string;
  sponsorName: string;
}

export function BookingForm({ adSlotId, sponsorName }: BookingFormProps) {
  const [bookState, bookAction] = useActionState(bookAdSlotAction, initialState);
  const [unbookState, unbookAction] = useActionState(unbookAdSlotAction, initialState);

  if (bookState.success) {
    return (
      <div className="mt-6 rounded-2xl border border-[--color-success]/20 bg-[--color-success-subtle] p-6">
        <h3 className="font-semibold text-[--color-success]">Placement Booked!</h3>
        <p className="mt-1 text-sm text-[--color-success] opacity-80">
          Your request has been submitted. The publisher will be in touch soon.
        </p>
        <form action={unbookAction} className="mt-4">
          <input type="hidden" name="adSlotId" value={adSlotId} />
          {unbookState.error && (
            <p className="mb-2 text-sm text-[--color-error]">{unbookState.error}</p>
          )}
          <SubmitButton
            pendingText="Removing..."
            className="cursor-pointer text-sm text-[--color-success] underline hover:opacity-80"
          >
            Remove Booking (reset for testing)
          </SubmitButton>
        </form>
      </div>
    );
  }

  return (
    <div className="mt-6 border-t border-[--color-border] pt-6">
      <h2 className="mb-4 text-xl font-semibold">Request This Placement</h2>

      <form action={bookAction} className="space-y-4">
        <input type="hidden" name="adSlotId" value={adSlotId} />

        <div>
          <label className="mb-1 block text-sm font-medium text-[--color-text-secondary]">
            Your Company
          </label>
          <p className="font-medium text-[--color-text-primary]">{sponsorName}</p>
        </div>

        <div>
          <label
            htmlFor="message"
            className="mb-1 block text-sm font-medium text-[--color-text-secondary]"
          >
            Message to Publisher (optional)
          </label>
          <textarea
            id="message"
            name="message"
            placeholder="Tell the publisher about your campaign goals..."
            rows={3}
          />
        </div>

        {bookState.error && (
          <p className="text-sm text-[--color-error]">{bookState.error}</p>
        )}

        <SubmitButton
          pendingText="Booking..."
          className="flex min-h-[48px] w-full cursor-pointer items-center justify-center gap-2 rounded-[--radius-md] bg-[--color-primary] px-4 py-3 font-semibold text-white transition-colors hover:bg-[--color-primary-hover] disabled:opacity-50"
        >
          Book This Placement
        </SubmitButton>
      </form>
    </div>
  );
}
