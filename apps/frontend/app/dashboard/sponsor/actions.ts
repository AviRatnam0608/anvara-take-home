'use server';

import { revalidatePath } from 'next/cache';
import { serverApi } from '@/lib/server-api';
import type { ActionState } from '@/lib/types';
import { parseCurrency } from '@/lib/utils';

const VALID_CAMPAIGN_STATUSES = [
  'DRAFT',
  'PENDING_REVIEW',
  'APPROVED',
  'ACTIVE',
  'PAUSED',
  'COMPLETED',
  'CANCELLED',
];

// ─── Create ──────────────────────────────────────────────────────────
export async function createCampaignAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const name = formData.get('name')?.toString().trim() ?? '';
  const description = formData.get('description')?.toString().trim() || undefined;
  const budgetRaw = formData.get('budget')?.toString() ?? '';
  const startDate = formData.get('startDate')?.toString() ?? '';
  const endDate = formData.get('endDate')?.toString() ?? '';

  // Validation
  const fieldErrors: Record<string, string> = {};
  if (!name) fieldErrors.name = 'Name is required';

  const budget = parseFloat(parseCurrency(budgetRaw));
  if (!budget || isNaN(budget) || budget <= 0) {
    fieldErrors.budget = 'Budget must be a positive number';
  }

  if (!startDate) fieldErrors.startDate = 'Start date is required';
  if (!endDate) fieldErrors.endDate = 'End date is required';

  if (startDate && endDate && new Date(startDate) >= new Date(endDate))
    fieldErrors.endDate = 'End date must be after start date';

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  const { error } = await serverApi('/api/campaigns', {
    method: 'POST',
    body: JSON.stringify({
      name,
      description,
      budget,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
    }),
  });

  if (error) {
    return { error };
  }

  revalidatePath('/dashboard/sponsor');
  return { success: true };
}

// ─── Update ──────────────────────────────────────────────────────────
export async function updateCampaignAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const id = formData.get('id')?.toString() ?? '';
  const name = formData.get('name')?.toString().trim() ?? '';
  const description = formData.get('description')?.toString().trim() || undefined;
  const budgetRaw = formData.get('budget')?.toString() ?? '';
  const status = formData.get('status')?.toString() ?? '';
  const startDate = formData.get('startDate')?.toString() ?? '';
  const endDate = formData.get('endDate')?.toString() ?? '';

  // Validation
  const fieldErrors: Record<string, string> = {};
  if (!id) return { error: 'Missing campaign ID' };
  if (!name) fieldErrors.name = 'Name is required';

  const budget = parseFloat(parseCurrency(budgetRaw));
  if (!budgetRaw || isNaN(budget) || budget <= 0)
    fieldErrors.budget = 'Budget must be a positive number';

  if (status && !VALID_CAMPAIGN_STATUSES.includes(status))
    fieldErrors.status = `Invalid status. Must be one of: ${VALID_CAMPAIGN_STATUSES.join(', ')}`;

  if (!startDate) fieldErrors.startDate = 'Start date is required';
  if (!endDate) fieldErrors.endDate = 'End date is required';

  if (startDate && endDate && new Date(startDate) >= new Date(endDate))
    fieldErrors.endDate = 'End date must be after start date';

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  const updateData: Record<string, unknown> = {
    name,
    description,
    budget,
    startDate: new Date(startDate).toISOString(),
    endDate: new Date(endDate).toISOString(),
  };
  if (status) updateData.status = status;

  const { error } = await serverApi(`/api/campaigns/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updateData),
  });

  if (error) {
    return { error };
  }

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
