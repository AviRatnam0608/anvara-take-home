'use server';

import { revalidatePath } from 'next/cache';
import { serverApi } from '@/lib/server-api';
import type { ActionState } from '@/lib/types';

export interface RequestQuoteActionState extends ActionState {
  quoteId?: string;
  verificationLevel?: 'low' | 'medium' | 'high';
  estimatedResponseTime?: string;
}

// ─── Book ───────────────────────────────────────────────────────────
export async function bookAdSlotAction(
  _prevState: ActionState,
  formData: FormData
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

// ─── Request Quote ───────────────────────────────────────────────────
export async function requestQuoteAction(
  _prevState: RequestQuoteActionState,
  formData: FormData
): Promise<RequestQuoteActionState> {
  const adSlotId = formData.get('adSlotId')?.toString().trim() ?? '';
  const companyName = formData.get('companyName')?.toString().trim() ?? '';
  const workEmail = formData.get('workEmail')?.toString().trim() ?? '';
  const specialRequirements = formData.get('specialRequirements')?.toString().trim() ?? '';

  const fieldErrors: Record<string, string> = {};
  if (!companyName) fieldErrors.companyName = 'Company name is required';
  if (!workEmail) {
    fieldErrors.workEmail = 'Work email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(workEmail)) {
    fieldErrors.workEmail = 'Enter a valid email address';
  }
  if (!specialRequirements) {
    fieldErrors.specialRequirements = 'Please describe your requirements';
  } else if (specialRequirements.length < 20) {
    fieldErrors.specialRequirements = 'Please provide at least 20 characters';
  }
  if (!adSlotId) {
    return { error: 'Missing ad slot ID' };
  }
  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  const payload = {
    adSlotId,
    companyName,
    workEmail,
    phone: formData.get('phone')?.toString().trim() || undefined,
    budgetRange: formData.get('budgetRange')?.toString().trim() || undefined,
    campaignGoal: formData.get('campaignGoal')?.toString().trim() || undefined,
    timelineStart: formData.get('timelineStart')?.toString().trim() || undefined,
    timelineEnd: formData.get('timelineEnd')?.toString().trim() || undefined,
    companyWebsite: formData.get('companyWebsite')?.toString().trim() || undefined,
    legalEntityName: formData.get('legalEntityName')?.toString().trim() || undefined,
    specialRequirements,
    complianceAcknowledgement: formData.get('complianceAcknowledgement') === 'on',
  };

  const { data, error } = await serverApi<{
    success: boolean;
    quoteId: string;
    verificationLevel: 'low' | 'medium' | 'high';
    estimatedResponseTime: string;
  }>('/api/quotes/request', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (error) {
    return { error };
  }

  return {
    success: true,
    quoteId: data?.quoteId,
    verificationLevel: data?.verificationLevel,
    estimatedResponseTime: data?.estimatedResponseTime,
  };
}

// ─── Unbook ─────────────────────────────────────────────────────────
export async function unbookAdSlotAction(
  _prevState: ActionState,
  formData: FormData
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
