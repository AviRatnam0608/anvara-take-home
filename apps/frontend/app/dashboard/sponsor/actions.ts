'use server';

import { ActionState } from '@/lib/types';
import { serverApi } from '@/lib/server-api';
import { revalidatePath } from 'next/cache';
import { parseCampaignForm, validateCampaignForm, normalizeCampaignDates } from './campaign-form';

// ─── Create ──────────────────────────────────────────────────────────
export async function createCampaignAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const data = parseCampaignForm(formData);

  const fieldErrors = validateCampaignForm(data);
  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  const dates = normalizeCampaignDates(data.startDate, data.endDate);

  const { error } = await serverApi('/api/campaigns', {
    method: 'POST',
    body: JSON.stringify({
      name: data.name,
      description: data.description,
      budget: data.budget,
      ...dates,
    }),
  });

  if (error) return { error };

  revalidatePath('/dashboard/sponsor');
  return { success: true };
}

// ─── Update ──────────────────────────────────────────────────────────
export async function updateCampaignAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const id = formData.get('id')?.toString() ?? '';
  if (!id) return { error: 'Missing campaign ID' };

  const data = parseCampaignForm(formData);

  const fieldErrors = validateCampaignForm(data);
  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  const dates = normalizeCampaignDates(data.startDate, data.endDate);

  const updateData: Record<string, unknown> = {
    name: data.name,
    description: data.description,
    budget: data.budget,
    ...dates,
  };

  if (data.status) updateData.status = data.status;

  const { error } = await serverApi(`/api/campaigns/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updateData),
  });

  if (error) return { error };

  revalidatePath('/dashboard/sponsor');
  return { success: true };
}

// ─── Delete ──────────────────────────────────────────────────────────
export async function deleteCampaignAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const id = formData.get('id')?.toString() ?? '';
  if (!id) return { error: 'Missing campaign ID' };

  const { error } = await serverApi(`/api/campaigns/${id}`, {
    method: 'DELETE',
  });

  if (error) {
    return { error };
  }

  revalidatePath('/dashboard/sponsor');
  return { success: true };
}
