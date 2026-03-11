'use server';

import { revalidatePath } from 'next/cache';
import { serverApi } from '@/lib/server-api';
import type { ActionState } from '@/lib/types';
import { parseCurrency } from '@/lib/utils';

const VALID_AD_SLOT_TYPES = ['DISPLAY', 'VIDEO', 'NATIVE', 'NEWSLETTER', 'PODCAST'];

// ─── Create ──────────────────────────────────────────────────────────
export async function createAdSlotAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const name = formData.get('name')?.toString().trim() ?? '';
  const description = formData.get('description')?.toString().trim() || undefined;
  const type = formData.get('type')?.toString() ?? '';
  const basePriceRaw = formData.get('basePrice')?.toString() ?? '';

  // Validation
  const fieldErrors: Record<string, string> = {};
  if (!name) fieldErrors.name = 'Name is required';
  if (!type) fieldErrors.type = 'Type is required';
  else if (!VALID_AD_SLOT_TYPES.includes(type))
    fieldErrors.type = `Invalid type. Must be one of: ${VALID_AD_SLOT_TYPES.join(', ')}`;

  const basePrice = parseFloat(parseCurrency(basePriceRaw));
  if (!basePriceRaw || isNaN(basePrice) || basePrice <= 0)
    fieldErrors.basePrice = 'Base price must be a positive number';

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  const { error } = await serverApi('/api/ad-slots', {
    method: 'POST',
    body: JSON.stringify({ name, description, type, basePrice }),
  });

  if (error) {
    return { error };
  }

  revalidatePath('/dashboard/publisher');
  return { success: true };
}

// ─── Update ──────────────────────────────────────────────────────────
export async function updateAdSlotAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const id = formData.get('id')?.toString() ?? '';
  const name = formData.get('name')?.toString().trim() ?? '';
  const description = formData.get('description')?.toString().trim() || undefined;
  const type = formData.get('type')?.toString() ?? '';
  const basePriceRaw = formData.get('basePrice')?.toString() ?? '';

  // Validation
  const fieldErrors: Record<string, string> = {};
  if (!id) return { error: 'Missing ad slot ID' };
  if (!name) fieldErrors.name = 'Name is required';
  if (!type) fieldErrors.type = 'Type is required';
  else if (!VALID_AD_SLOT_TYPES.includes(type))
    fieldErrors.type = `Invalid type. Must be one of: ${VALID_AD_SLOT_TYPES.join(', ')}`;

  const basePrice = parseFloat(parseCurrency(basePriceRaw));
  if (!basePriceRaw || isNaN(basePrice) || basePrice <= 0)
    fieldErrors.basePrice = 'Base price must be a positive number';

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  const { error } = await serverApi(`/api/ad-slots/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ name, description, type, basePrice }),
  });

  if (error) {
    return { error };
  }

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
