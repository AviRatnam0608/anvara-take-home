import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getUserRole } from '@/lib/auth-helpers';
import { serverApi } from '@/lib/server-api';
import type { Campaign } from '@/lib/types';
import { CampaignList } from './components/campaign-list';
import { CreateCampaignForm } from './components/create-campaign-form';

export default async function SponsorDashboard() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect('/login');
  }

  // Verify user has 'sponsor' role
  const roleData = await getUserRole(session.user.id);
  if (roleData.role !== 'sponsor') {
    redirect('/');
  }

  // Fetch campaigns server-side using serverApi (cookie forwarding built-in)
  let campaigns: Campaign[] = [];
  let error: string | null = null;

  if (roleData.sponsorId) {
    const result = await serverApi<Campaign[]>(
      `/api/campaigns?sponsorId=${roleData.sponsorId}`,
    );
    if (result.error) {
      error = result.error;
    } else {
      campaigns = result.data ?? [];
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Campaigns</h1>
        <CreateCampaignForm />
      </div>

      {error ? (
        <div className="rounded border border-red-200 bg-red-50 p-4 text-red-600">{error}</div>
      ) : (
        <CampaignList campaigns={campaigns} />
      )}
    </div>
  );
}
