// Simple API client
// FIXME: This client has no error response parsing - when API returns { error: "..." },
// we should extract and throw that message instead of generic "API request failed"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4291';

export async function api<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    credentials: 'include', // Send session cookie for cookie-based auth
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
  if (!res.ok) throw new Error('API request failed');
  return res.json();
}

// Campaigns
export const getCampaigns = (sponsorId?: string, options?: RequestInit) =>
  api<any[]>(sponsorId ? `/api/campaigns?sponsorId=${sponsorId}` : '/api/campaigns', options);
export const getCampaign = (id: string, options?: RequestInit) =>
  api<any>(`/api/campaigns/${id}`, options);
export const createCampaign = (data: any) =>
  api('/api/campaigns', { method: 'POST', body: JSON.stringify(data) });
export const updateCampaign = (id: string, data: any, options?: RequestInit) =>
  api<any>(`/api/campaigns/${id}`, { method: 'PUT', body: JSON.stringify(data), ...options });
export const deleteCampaign = (id: string, options?: RequestInit) =>
  api<void>(`/api/campaigns/${id}`, { method: 'DELETE', ...options });

// Ad Slots
export const getAdSlots = (publisherId?: string, options?: RequestInit) =>
  api<any[]>(
    publisherId ? `/api/ad-slots?publisherId=${publisherId}` : '/api/ad-slots',
    options,
  );
export const getAdSlot = (id: string, options?: RequestInit) =>
  api<any>(`/api/ad-slots/${id}`, options);
export const createAdSlot = (data: any, options?: RequestInit) =>
  api('/api/ad-slots', { method: 'POST', body: JSON.stringify(data), ...options });
export const updateAdSlot = (id: string, data: any, options?: RequestInit) =>
  api<any>(`/api/ad-slots/${id}`, { method: 'PUT', body: JSON.stringify(data), ...options });
export const deleteAdSlot = (id: string, options?: RequestInit) =>
  api<void>(`/api/ad-slots/${id}`, { method: 'DELETE', ...options });

// Placements
export const getPlacements = (options?: RequestInit) => api<any[]>('/api/placements', options);
export const createPlacement = (data: any, options?: RequestInit) =>
  api('/api/placements', { method: 'POST', body: JSON.stringify(data), ...options });

// Dashboard
export const getStats = (options?: RequestInit) => api<any>('/api/dashboard/stats', options);
