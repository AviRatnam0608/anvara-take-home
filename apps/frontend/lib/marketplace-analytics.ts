'use client';

export type MarketplaceEventName =
  | 'marketplace_card_click'
  | 'marketplace_book_submit'
  | 'marketplace_quote_open'
  | 'marketplace_quote_submit'
  | 'marketplace_quote_success'
  | 'marketplace_quote_error';

export function trackMarketplaceEvent(
  event: MarketplaceEventName,
  payload: Record<string, unknown> = {}
): void {
  if (typeof window === 'undefined') return;

  const detail = {
    event,
    payload,
    timestamp: new Date().toISOString(),
  };

  window.dispatchEvent(new CustomEvent('marketplace:analytics', { detail }));

  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.info('[marketplace-analytics]', detail);
  }
}
