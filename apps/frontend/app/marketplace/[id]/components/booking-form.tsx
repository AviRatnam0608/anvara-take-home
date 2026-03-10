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
      <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4">
        <h3 className="font-semibold text-green-800">Placement Booked!</h3>
        <p className="mt-1 text-sm text-green-700">
          Your request has been submitted. The publisher will be in touch soon.
        </p>
        <form action={unbookAction} className="mt-3">
          <input type="hidden" name="adSlotId" value={adSlotId} />
          {unbookState.error && (
            <p className="mb-2 text-sm text-red-600">{unbookState.error}</p>
          )}
          <SubmitButton
            pendingText="Removing..."
            className="cursor-pointer text-sm text-green-700 underline hover:text-green-800"
          >
            Remove Booking (reset for testing)
          </SubmitButton>
        </form>
      </div>
    );
  }

  return (
    <div className="mt-6 border-t border-[--color-border] pt-6">
      <h2 className="mb-4 text-lg font-semibold">Request This Placement</h2>

      <form action={bookAction} className="space-y-4">
        <input type="hidden" name="adSlotId" value={adSlotId} />

        <div>
          <label className="mb-1 block text-sm font-medium text-[--color-muted]">
            Your Company
          </label>
          <p className="text-[--color-foreground]">{sponsorName}</p>
        </div>

        <div>
          <label
            htmlFor="message"
            className="mb-1 block text-sm font-medium text-[--color-muted]"
          >
            Message to Publisher (optional)
          </label>
          <textarea
            id="message"
            name="message"
            placeholder="Tell the publisher about your campaign goals..."
            className="w-full rounded-lg border border-[--color-border] bg-[--color-background] px-3 py-2 text-[--color-foreground] placeholder:text-[--color-muted] focus:border-[--color-primary] focus:outline-none focus:ring-1 focus:ring-[--color-primary]"
            rows={3}
          />
        </div>

        {bookState.error && <p className="text-sm text-red-600">{bookState.error}</p>}

        <SubmitButton
          pendingText="Booking..."
          className="w-full cursor-pointer rounded-lg bg-[--color-primary] px-4 py-3 font-semibold text-white transition-colors hover:opacity-90 disabled:opacity-50"
        >
          Book This Placement
        </SubmitButton>
      </form>
    </div>
  );
}
