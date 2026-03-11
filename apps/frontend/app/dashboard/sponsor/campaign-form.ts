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

export interface ParsedCampaignForm {
  name: string;
  description?: string;
  budget: number;
  status?: string;
  startDate: string;
  endDate: string;
}

export function parseCampaignForm(formData: FormData) {
  const name = formData.get('name')?.toString().trim() ?? '';
  const description = formData.get('description')?.toString().trim() || undefined;
  const budgetRaw = formData.get('budget')?.toString() ?? '';
  const status = formData.get('status')?.toString() ?? '';
  const startDate = formData.get('startDate')?.toString() ?? '';
  const endDate = formData.get('endDate')?.toString() ?? '';

  const budget = parseFloat(parseCurrency(budgetRaw));

  return {
    name,
    description,
    budget,
    status,
    startDate,
    endDate,
    budgetRaw,
  };
}

export function validateCampaignForm(data: ReturnType<typeof parseCampaignForm>) {
  const fieldErrors: Record<string, string> = {};

  if (!data.name) fieldErrors.name = 'Name is required';

  if (!data.budget || isNaN(data.budget) || data.budget <= 0)
    fieldErrors.budget = 'Budget must be a positive number';

  if (data.status && !VALID_CAMPAIGN_STATUSES.includes(data.status))
    fieldErrors.status = `Invalid status. Must be one of: ${VALID_CAMPAIGN_STATUSES.join(', ')}`;

  if (!data.startDate) fieldErrors.startDate = 'Start date is required';
  if (!data.endDate) fieldErrors.endDate = 'End date is required';

  if (data.startDate && data.endDate && new Date(data.startDate) >= new Date(data.endDate))
    fieldErrors.endDate = 'End date must be after start date';

  return fieldErrors;
}

export function normalizeCampaignDates(startDate: string, endDate: string) {
  return {
    startDate: new Date(startDate).toISOString(),
    endDate: new Date(endDate).toISOString(),
  };
}
