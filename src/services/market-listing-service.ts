import { apiFetch } from '@/services/api-client';
import type { ListingCategory, ListingType, MarketListing } from '@/types/market-listing';

export type MarketListingFilter = {
  type?: ListingType;
  category?: ListingCategory;
  search?: string;
  /** Narrows the list to the signed-in user's own listings — what they uploaded, rather than
   *  everything on offer. This is what the main grid asks for. */
  mine?: boolean;
};

export function getMarketListings(filter: MarketListingFilter = {}): Promise<MarketListing[]> {
  const params = new URLSearchParams();
  if (filter.type) params.set('type', filter.type);
  if (filter.category) params.set('category', filter.category);
  if (filter.search) params.set('search', filter.search);
  if (filter.mine) params.set('mine', 'true');
  const query = params.toString();
  return apiFetch<MarketListing[]>(`/api/marketlistings${query ? `?${query}` : ''}`);
}

export function getMarketListing(id: number): Promise<MarketListing> {
  return apiFetch<MarketListing>(`/api/marketlistings/${id}`);
}
