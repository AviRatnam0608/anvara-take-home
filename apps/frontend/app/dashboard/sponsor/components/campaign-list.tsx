import type { Campaign } from '@/lib/types';
import { MegaphoneIcon } from '@phosphor-icons/react/dist/ssr';
import { CampaignCard } from './campaign-card';

interface CampaignListProps {
  campaigns: Campaign[];
}

export function CampaignList({ campaigns }: CampaignListProps) {
  if (campaigns.length === 0) {
    return (
      <div className="empty-state-card">
        <MegaphoneIcon
          size={48}
          weight="duotone"
          className="mx-auto mb-4 text-[var(--color-text-muted)]"
        />
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">No campaigns yet</h3>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Create your first campaign to start reaching publishers.
        </p>
      </div>
    );
  }

  return (
    <div className="stagger-children card-grid">
      {campaigns.map((campaign) => (
        <CampaignCard key={campaign.id} campaign={campaign} />
      ))}
    </div>
  );
}
