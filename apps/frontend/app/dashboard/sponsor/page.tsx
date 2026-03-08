import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getUserRole } from '@/lib/auth-helpers';
import { getCampaigns } from '@/lib/api';
import type { Campaign } from '@/lib/types';
import { CampaignList } from './components/campaign-list';

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

  // Forward session cookie so backend authMiddleware can validate the request
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join('; ');

  // Fetch campaigns server-side — no client-side fetch needed
  let campaigns: Campaign[] = [];
  let error: string | null = null;

  try {
    campaigns = await getCampaigns(roleData.sponsorId, {
      headers: { Cookie: cookieHeader },
    });
  } catch {
    error = 'Failed to load campaigns';
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Campaigns</h1>
        {/* TODO: Add CreateCampaignButton here */}
      </div>

      {error ? (
        <div className="rounded border border-red-200 bg-red-50 p-4 text-red-600">{error}</div>
      ) : (
        <CampaignList campaigns={campaigns} />
      )}
    </div>
  );
}
