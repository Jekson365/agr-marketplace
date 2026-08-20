const PRICE_FORMAT = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'GEL',
  maximumFractionDigits: 2,
});

export function formatPrice(value: number): string {
  return PRICE_FORMAT.format(value);
}
