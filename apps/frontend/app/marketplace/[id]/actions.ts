'use server';

import { revalidatePath } from 'next/cache';
import { serverApi } from '@/lib/server-api';
import type { ActionState } from '@/lib/types';

// ─── Book ───────────────────────────────────────────────────────────
export async function bookAdSlotAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const adSlotId = formData.get('adSlotId')?.toString() ?? '';
  const message = formData.get('message')?.toString().trim() || undefined;

  if (!adSlotId) return { error: 'Missing ad slot ID' };

  const { error } = await serverApi(`/api/ad-slots/${adSlotId}/book`, {
    method: 'POST',
    body: JSON.stringify({ message }),
  });

  if (error) {
    return { error };
  }

  revalidatePath(`/marketplace/${adSlotId}`);
  revalidatePath('/marketplace');
  return { success: true };
}

// ─── Unbook ─────────────────────────────────────────────────────────
export async function unbookAdSlotAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const adSlotId = formData.get('adSlotId')?.toString() ?? '';
  if (!adSlotId) return { error: 'Missing ad slot ID' };

  const { error } = await serverApi(`/api/ad-slots/${adSlotId}/unbook`, {
    method: 'POST',
  });

  if (error) {
    return { error };
  }

  revalidatePath(`/marketplace/${adSlotId}`);
  revalidatePath('/marketplace');
  return { success: true };
}
