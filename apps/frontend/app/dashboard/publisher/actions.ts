'use server';

import { revalidatePath } from 'next/cache';
import { serverApi } from '@/lib/server-api';
import type { ActionState } from '@/lib/types';
import { parseAdSlotForm, validateAdSlotForm } from './ad-slot-form';

// ─── Create ──────────────────────────────────────────────────────────
export async function createAdSlotAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const data = parseAdSlotForm(formData);

  const fieldErrors = validateAdSlotForm(data);
  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  const { error } = await serverApi('/api/ad-slots', {
    method: 'POST',
    body: JSON.stringify({
      name: data.name,
      description: data.description,
      type: data.type,
      basePrice: data.basePrice,
    }),
  });

  if (error) return { error };

  revalidatePath('/dashboard/publisher');
  return { success: true };
}

// ─── Update ──────────────────────────────────────────────────────────
export async function updateAdSlotAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const id = formData.get('id')?.toString() ?? '';
  if (!id) return { error: 'Missing ad slot ID' };

  const data = parseAdSlotForm(formData);

  const fieldErrors = validateAdSlotForm(data);
  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  const { error } = await serverApi(`/api/ad-slots/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      name: data.name,
      description: data.description,
      type: data.type,
      basePrice: data.basePrice,
    }),
  });

  if (error) return { error };

  revalidatePath('/dashboard/publisher');
  return { success: true };
}

// ─── Delete ──────────────────────────────────────────────────────────
export async function deleteAdSlotAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const id = formData.get('id')?.toString() ?? '';
  if (!id) return { error: 'Missing ad slot ID' };

  const { error } = await serverApi(`/api/ad-slots/${id}`, {
    method: 'DELETE',
  });

  if (error) {
    return { error };
  }

  revalidatePath('/dashboard/publisher');
  return { success: true };
}
