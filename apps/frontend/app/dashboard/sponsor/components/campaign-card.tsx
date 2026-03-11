'use client';

import { useState } from 'react';
import type { Campaign } from '@/lib/types';
import { PencilSimpleIcon } from '@phosphor-icons/react';
import { EditCampaignForm } from './edit-campaign-form';
import { DeleteCampaignButton } from './delete-campaign-button';

interface CampaignCardProps {
  campaign: Campaign;
}

const statusColors: Record<string, string> = {
  DRAFT: 'bg-[var(--color-bg-input)] text-[var(--color-text-muted)]',
  ACTIVE: 'bg-[var(--color-success-subtle)] text-[var(--color-success)]',
  PAUSED: 'bg-[var(--color-warning-subtle)] text-[var(--color-warning)]',
  COMPLETED: 'bg-[var(--color-primary-subtle)] text-[var(--color-primary)]',
};

export function CampaignCard({ campaign }: CampaignCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const progress =
    campaign.budget > 0 ? (Number(campaign.spent) / Number(campaign.budget)) * 100 : 0;

  return (
    <>
      <div className="card">
        <div className="mb-3 flex items-start justify-between gap-3">
          <h3 className="font-semibold text-[var(--color-text-primary)]">{campaign.name}</h3>
          <span
            className={`badge ${statusColors[campaign.status] || 'bg-[var(--color-bg-input)] text-[var(--color-text-muted)]'}`}
          >
            {campaign.status.charAt(0) + campaign.status.slice(1).toLowerCase()}
          </span>
        </div>

        {campaign.description && (
          <p className="mb-4 text-sm leading-relaxed text-[var(--color-text-secondary)] line-clamp-2">
            {campaign.description}
          </p>
        )}

        <div className="mb-3">
          <div className="flex justify-between text-sm">
            <span className="text-[var(--color-text-muted)]">Budget</span>
            <span className="font-medium text-[var(--color-text-primary)]">
              ${Number(campaign.spent).toLocaleString()} / $
              {Number(campaign.budget).toLocaleString()}
            </span>
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-[var(--color-border)]">
            <div
              className="h-1.5 rounded-full bg-[var(--color-primary)] transition-all duration-500"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>

        <div className="text-xs text-[var(--color-text-muted)]">
          {new Date(campaign.startDate).toLocaleDateString()} –{' '}
          {new Date(campaign.endDate).toLocaleDateString()}
        </div>

        {/* Edit / Delete actions */}
        <div className="mt-4 flex items-center gap-2 border-t border-[var(--color-border)] pt-4">
          <button
            onClick={() => setIsEditing(true)}
            className="btn btn-md cursor-pointer gap-1.5 rounded-[var(--radius-sm)] px-3 text-[var(--color-primary)] hover:bg-[var(--color-primary-subtle)]"
          >
            <PencilSimpleIcon size={16} />
            Edit
          </button>
          <DeleteCampaignButton campaignId={campaign.id} campaignName={campaign.name} />
        </div>
      </div>

      {isEditing && (
        <EditCampaignForm campaign={campaign} onClose={() => setIsEditing(false)} />
      )}
    </>
  );
}
