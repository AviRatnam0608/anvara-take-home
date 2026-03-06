import type { Campaign } from '@/lib/types';
import { CampaignCard } from './campaign-card';

interface CampaignListProps {
  campaigns: Campaign[];
}

// TODO: Add sorting options (by date, budget, status)
// TODO: Add pagination if campaigns list gets large
export function CampaignList({ campaigns }: CampaignListProps) {
  if (campaigns.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[--color-border] p-8 text-center text-[--color-muted]">
        No campaigns yet. Create your first campaign to get started.
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {campaigns.map((campaign) => (
        <CampaignCard key={campaign.id} campaign={campaign} />
      ))}
    </div>
  );
}
