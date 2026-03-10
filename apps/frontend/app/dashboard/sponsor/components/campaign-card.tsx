'use client';

import { useState } from 'react';
import type { Campaign } from '@/lib/types';
import { PencilSimple } from '@phosphor-icons/react';
import { EditCampaignForm } from './edit-campaign-form';
import { DeleteCampaignButton } from './delete-campaign-button';

interface CampaignCardProps {
  campaign: Campaign;
}

const statusColors: Record<string, string> = {
  DRAFT: 'bg-[--color-bg-input] text-[--color-text-muted]',
  ACTIVE: 'bg-[--color-success-subtle] text-[--color-success]',
  PAUSED: 'bg-[--color-warning-subtle] text-[--color-warning]',
  COMPLETED: 'bg-[--color-primary-subtle] text-[--color-primary]',
};

export function CampaignCard({ campaign }: CampaignCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const progress =
    campaign.budget > 0 ? (Number(campaign.spent) / Number(campaign.budget)) * 100 : 0;

  return (
    <>
      <div className="card">
        <div className="mb-3 flex items-start justify-between gap-3">
          <h3 className="font-semibold text-[--color-text-primary]">{campaign.name}</h3>
          <span
            className={`badge ${statusColors[campaign.status] || 'bg-[--color-bg-input] text-[--color-text-muted]'}`}
          >
            {campaign.status.charAt(0) + campaign.status.slice(1).toLowerCase()}
          </span>
        </div>

        {campaign.description && (
          <p className="mb-4 text-sm leading-relaxed text-[--color-text-secondary] line-clamp-2">
            {campaign.description}
          </p>
        )}

        <div className="mb-3">
          <div className="flex justify-between text-sm">
            <span className="text-[--color-text-muted]">Budget</span>
            <span className="font-medium text-[--color-text-primary]">
              ${Number(campaign.spent).toLocaleString()} / $
              {Number(campaign.budget).toLocaleString()}
            </span>
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-[--color-border]">
            <div
              className="h-1.5 rounded-full bg-[--color-primary] transition-all duration-500"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>

        <div className="text-xs text-[--color-text-muted]">
          {new Date(campaign.startDate).toLocaleDateString()} –{' '}
          {new Date(campaign.endDate).toLocaleDateString()}
        </div>

        {/* Edit / Delete actions */}
        <div className="mt-4 flex items-center gap-2 border-t border-[--color-border] pt-4">
          <button
            onClick={() => setIsEditing(true)}
            className="btn btn-md cursor-pointer gap-1.5 rounded-[--radius-sm] px-3 text-[--color-primary] hover:bg-[--color-primary-subtle]"
          >
            <PencilSimple size={16} />
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
