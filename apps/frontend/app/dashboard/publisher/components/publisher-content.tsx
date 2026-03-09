'use client';

import { useState } from 'react';
import { AdSlotList } from './ad-slot-list';
import { CreateAdSlotForm } from './create-ad-slot-form';

export function PublisherContent() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  function handleAdSlotCreated() {
    setRefreshTrigger((prev) => prev + 1);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Ad Slots</h1>
        <CreateAdSlotForm onSuccess={handleAdSlotCreated} />
      </div>

      <AdSlotList refreshTrigger={refreshTrigger} />
    </div>
  );
}
