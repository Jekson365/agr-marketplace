import type { ListingCategory, ListingType } from '@/types/market-listing';

/**
 * The buy-or-rent filter. `null` is "all", which is not a listing type the server knows — it is
 * the absence of the filter, so the option list carries it rather than the type union.
 *
 * Labelled with actions ("Buy", "Rent") rather than the nouns `typeSale`/`typeRent` the card
 * badges use: a badge says what a listing *is*, a filter says what you want to *do*.
 */
export const LISTING_TYPE_OPTIONS: { value: ListingType | null; labelKey: string }[] = [
  { value: null, labelKey: 'market.filterAll' },
  { value: 'Sale', labelKey: 'market.filterBuy' },
  { value: 'Rent', labelKey: 'market.filterRent' },
];

/**
 * The category filter's options, in the order the web SPA offers them and under the same
 * translation keys — its `config/market-listing.ts` holds the same list.
 *
 * Note two of them do not read the way their name does: `TreeStock` is an orchard, so its key is
 * `categoryFruit`, and `TreeProduct` is what the orchard yields.
 */
/** The same keys by category, for looking one up rather than listing them all. */
export const LISTING_CATEGORY_LABEL_KEY: Record<ListingCategory, string> = {
  Stock: 'market.categoryStock',
  TreeStock: 'market.categoryFruit',
  Livestock: 'market.categoryLivestock',
  Equipment: 'market.categoryEquipment',
  TreeProduct: 'market.categoryTreeProduct',
  Other: 'market.categoryOther',
};

export const LISTING_CATEGORY_OPTIONS: { value: ListingCategory; labelKey: string }[] = [
  { value: 'Stock', labelKey: 'market.categoryStock' },
  { value: 'TreeStock', labelKey: 'market.categoryFruit' },
  { value: 'Livestock', labelKey: 'market.categoryLivestock' },
  { value: 'Equipment', labelKey: 'market.categoryEquipment' },
  { value: 'TreeProduct', labelKey: 'market.categoryTreeProduct' },
  { value: 'Other', labelKey: 'market.categoryOther' },
];
