import { parseCurrency } from '@/lib/utils';

export const VALID_AD_SLOT_TYPES = ['DISPLAY', 'VIDEO', 'NATIVE', 'NEWSLETTER', 'PODCAST'];

export interface ParsedAdSlotForm {
  name: string;
  description?: string;
  type: string;
  basePrice: number;
  basePriceRaw: string;
}

export function parseAdSlotForm(formData: FormData): ParsedAdSlotForm {
  const name = formData.get('name')?.toString().trim() ?? '';
  const description = formData.get('description')?.toString().trim() || undefined;
  const type = formData.get('type')?.toString() ?? '';
  const basePriceRaw = formData.get('basePrice')?.toString() ?? '';

  const basePrice = parseFloat(parseCurrency(basePriceRaw));

  return {
    name,
    description,
    type,
    basePrice,
    basePriceRaw,
  };
}

export function validateAdSlotForm(data: ParsedAdSlotForm) {
  const fieldErrors: Record<string, string> = {};

  if (!data.name) fieldErrors.name = 'Name is required';

  if (!data.type) fieldErrors.type = 'Type is required';
  else if (!VALID_AD_SLOT_TYPES.includes(data.type))
    fieldErrors.type = `Invalid type. Must be one of: ${VALID_AD_SLOT_TYPES.join(', ')}`;

  if (!data.basePriceRaw || isNaN(data.basePrice) || data.basePrice <= 0)
    fieldErrors.basePrice = 'Base price must be a positive number';

  return fieldErrors;
}
