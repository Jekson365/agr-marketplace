import { apiFetch } from '@/services/api-client';
import type { ListingCategory, ListingType, MarketListing } from '@/types/market-listing';

/**
 * The server also takes a `mine` flag, which narrows the list to the caller's own listings. It is
 * deliberately not offered here: it is the one read that needs a token, and this app has no
 * sign-in. Asking for it anonymously is answered 401.
 */
export type MarketListingFilter = {
  type?: ListingType;
  category?: ListingCategory;
  search?: string;
};

/** Every listing still on offer. The server drops the ones sellers have marked sold. */
export function getMarketListings(filter: MarketListingFilter = {}): Promise<MarketListing[]> {
  const params = new URLSearchParams();
  if (filter.type) params.set('type', filter.type);
  if (filter.category) params.set('category', filter.category);
  if (filter.search) params.set('search', filter.search);
  const query = params.toString();
  return apiFetch<MarketListing[]>(`/api/marketlistings${query ? `?${query}` : ''}`);
}

export function getMarketListing(id: number): Promise<MarketListing> {
  return apiFetch<MarketListing>(`/api/marketlistings/${id}`);
}
