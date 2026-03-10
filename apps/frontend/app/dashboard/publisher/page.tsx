import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getUserRole } from '@/lib/auth-helpers';
import { serverApi } from '@/lib/server-api';
import type { AdSlot } from '@/lib/types';
import { AdSlotList } from './components/ad-slot-list';
import { CreateAdSlotForm } from './components/create-ad-slot-form';

export default async function PublisherDashboard() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect('/login');
  }

  // Verify user has 'publisher' role
  const roleData = await getUserRole(session.user.id);
  if (roleData.role !== 'publisher') {
    redirect('/');
  }

  // Fetch ad slots server-side so revalidatePath works
  let adSlots: AdSlot[] = [];
  let error: string | null = null;

  if (roleData.publisherId) {
    const result = await serverApi<AdSlot[]>(
      `/api/ad-slots?publisherId=${roleData.publisherId}`,
    );
    if (result.error) {
      error = result.error;
    } else {
      adSlots = result.data ?? [];
    }
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-[--color-text-primary]">
          My Ad Slots
        </h1>
        <CreateAdSlotForm />
      </div>

      {error ? (
        <div className="alert-error">
          <p className="font-medium">Unable to load ad slots</p>
          <p className="mt-1 text-sm opacity-80">{error}</p>
        </div>
      ) : (
        <AdSlotList adSlots={adSlots} />
      )}
    </div>
  );
}
