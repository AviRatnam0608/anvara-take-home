import type { Campaign } from '@/lib/types';
import { Megaphone } from '@phosphor-icons/react/dist/ssr';
import { CampaignCard } from './campaign-card';

interface CampaignListProps {
  campaigns: Campaign[];
}

export function CampaignList({ campaigns }: CampaignListProps) {
  if (campaigns.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[--color-border] p-16 text-center">
        <Megaphone
          size={48}
          weight="duotone"
          className="mx-auto mb-4 text-[--color-text-muted]"
        />
        <h3 className="text-lg font-semibold text-[--color-text-primary]">No campaigns yet</h3>
        <p className="mt-1 text-sm text-[--color-text-secondary]">
          Create your first campaign to start reaching publishers.
        </p>
      </div>
    );
  }

  return (
    <div className="stagger-children grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {campaigns.map((campaign) => (
        <CampaignCard key={campaign.id} campaign={campaign} />
      ))}
    </div>
  );
}
