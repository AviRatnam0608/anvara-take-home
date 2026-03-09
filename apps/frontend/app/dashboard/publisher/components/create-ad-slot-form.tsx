'use client';

import { useState } from 'react';
import { createAdSlot } from '@/lib/api';
import type { AdSlot } from '@/lib/types';

const AD_SLOT_TYPES: AdSlot['type'][] = ['DISPLAY', 'VIDEO', 'NATIVE', 'NEWSLETTER', 'PODCAST'];

interface CreateAdSlotFormProps {
  onSuccess: () => void;
}

interface FormErrors {
  name?: string;
  type?: string;
  basePrice?: string;
}

export function CreateAdSlotForm({ onSuccess }: CreateAdSlotFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  // Form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<string>('');
  const [basePrice, setBasePrice] = useState('');

  function resetForm() {
    setName('');
    setDescription('');
    setType('');
    setBasePrice('');
    setErrors({});
    setApiError(null);
  }

  function validate(): FormErrors {
    const newErrors: FormErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!type) {
      newErrors.type = 'Type is required';
    }

    const price = parseFloat(basePrice);
    if (!basePrice || isNaN(price) || price <= 0) {
      newErrors.basePrice = 'Base price must be a positive number';
    }

    return newErrors;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setLoading(true);
    setApiError(null);

    try {
      await createAdSlot({
        name: name.trim(),
        description: description.trim() || undefined,
        type,
        basePrice: parseFloat(basePrice),
      });

      resetForm();
      setIsOpen(false);
      onSuccess();
    } catch {
      setApiError('Failed to create ad slot. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    resetForm();
    setIsOpen(false);
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="cursor-pointer rounded-lg bg-[--color-primary] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
      >
        Add Ad Slot
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg border border-[--color-border] text-black bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-lg font-bold">Create New Ad Slot</h2>

        {apiError && (
          <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-[--color-foreground]">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              placeholder="e.g. Header Banner"
              className={`mt-1 w-full rounded border px-3 py-2 text-gray-900 ${
                errors.name ? 'border-red-400' : 'border-[--color-border]'
              }`}
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-[--color-foreground]"
            >
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description of the ad slot"
              rows={2}
              className="mt-1 w-full rounded border border-[--color-border] px-3 py-2 text-gray-900"
            />
          </div>

          {/* Type */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-[--color-foreground]">
              Type <span className="text-red-500">*</span>
            </label>
            <select
              id="type"
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                if (errors.type) setErrors((prev) => ({ ...prev, type: undefined }));
              }}
              className={`mt-1 w-full rounded border bg-white px-3 py-2 text-gray-900 ${
                errors.type ? 'border-red-400' : 'border-[--color-border]'
              }`}
            >
              <option value="">Select a type...</option>
              {AD_SLOT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.charAt(0) + t.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
            {errors.type && <p className="mt-1 text-xs text-red-500">{errors.type}</p>}
          </div>

          {/* Base Price */}
          <div>
            <label
              htmlFor="basePrice"
              className="block text-sm font-medium text-[--color-foreground]"
            >
              Base Price ($/mo) <span className="text-red-500">*</span>
            </label>
            <input
              id="basePrice"
              type="number"
              min="0.01"
              step="0.01"
              value={basePrice}
              onChange={(e) => {
                setBasePrice(e.target.value);
                if (errors.basePrice) setErrors((prev) => ({ ...prev, basePrice: undefined }));
              }}
              placeholder="e.g. 500"
              className={`mt-1 w-full rounded border px-3 py-2 text-gray-900 ${
                errors.basePrice ? 'border-red-400' : 'border-[--color-border]'
              }`}
            />
            {errors.basePrice && <p className="mt-1 text-xs text-red-500">{errors.basePrice}</p>}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 text-black bg-[--color-primary] px-4 py-2 font-semibold hover:opacity-90 hover:cursor-pointer hover:bg-[--color-primary-hover] disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Ad Slot'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="rounded-lg border border-[--color-border] px-4 py-2 font-semibold text-[--color-foreground] hover:bg-gray-50 hover:cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
