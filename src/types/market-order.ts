/**
 * Mirrors the server's MarketOrder contract. Enums arrive as their names, so they are string
 * unions here.
 *
 * Note what a checkout request does NOT carry: a price or a total. The server prices the order
 * from the listing itself — a total the client can name is a total the client can choose.
 */
export type MarketOrderStatus = 'Pending' | 'Paid' | 'Failed' | 'Refunded';

export type CreateMarketOrderRequest = {
  listingId: number;
  buyerName: string;
  buyerSurname: string;
  buyerPhone: string;
  buyerAddress: string;
  buyerCity: string;
  buyerVillage: string;
  buyerFacebookUrl?: string;
  /** In the listing's own price unit. */
  quantity: number;
};

export type CreateMarketOrderResponse = {
  orderId: number;
  amount: number;
  currency: string;
  /** The bank's hosted payment page. Card details are only ever typed on the bank's own domain. */
  redirectUrl: string;
  /** True when no bank was involved and nothing was charged — the server has no merchant
   *  credentials, so `redirectUrl` points back into this app. */
  simulated: boolean;
};

export type MarketOrder = {
  id: number;
  listingId: number;
  quantity: number;
  amount: number;
  currency: string;
  status: MarketOrderStatus;
  /** The rate the order was split at, as a fraction — 0.001 is 0.1%. */
  commissionRate: number;
  platformFee: number;
  /** What the seller is owed. Simulated: nothing pays it out. */
  sellerAmount: number;
  createdAt: string;
  paidAt: string | null;
  settledAt: string | null;
};
