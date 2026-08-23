/**
 * Mirrors the server's MarketListingDto in camelCase. Enums arrive as their names, so they are
 * string-literal unions here; `itemType` stays a plain string because it names a row in a kind
 * catalog the user can add to.
 *
 * This is a hand-kept copy of `web/src/types/market-listing.ts` — the two frontends share no code,
 * so a change to the DTO has to be made in both.
 */
export type ListingType = 'Sale' | 'Rent';
export type ListingCategory = 'Stock' | 'TreeStock' | 'Livestock' | 'Equipment' | 'TreeProduct' | 'Other';
export type ListingStatus = 'Active' | 'Completed';

export type MarketListing = {
  id: number;
  sellerId: number;
  sellerName: string;
  /** Live from the seller's current profile (not a snapshot) — see server/Models/MarketListingDto.cs. */
  sellerSurname: string;
  sellerPhoneNumber: string;
  sellerImagePath: string;
  /** The seller's farm, empty when they have not named one. Shown in place of their own name on
   *  the listing page — see pages/listing-page.tsx. */
  sellerFarmName: string;
  type: ListingType;
  category: ListingCategory;
  itemType: string;
  title: string;
  description: string | null;
  price: number;
  priceUnit: string;
  quantity: number | null;
  location: string;
  imagePaths: string[];
  status: ListingStatus;
  /** A promoted listing: the server sorts these first, and the card wears a gold border. */
  isPremium: boolean;
  createdAt: string;
};
