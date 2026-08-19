import { apiFetch } from '@/services/api-client';
import type { CreateMarketOrderRequest, CreateMarketOrderResponse, MarketOrder } from '@/types/market-order';

/** Starts a checkout. The answer carries the bank's payment page to send the buyer to. */
export function createMarketOrder(request: CreateMarketOrderRequest): Promise<CreateMarketOrderResponse> {
  return apiFetch<CreateMarketOrderResponse>('/api/marketorders', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

/**
 * Reads an order back after the bank sends the buyer home.
 *
 * This is what the return page trusts, never the URL it landed on: the success address is only
 * where the buyer was *sent*, and anyone can type it. Only the bank's own callback moves an order
 * to Paid, and this is how the page finds out whether that has happened.
 */
export function getMarketOrder(id: number): Promise<MarketOrder> {
  return apiFetch<MarketOrder>(`/api/marketorders/${id}`);
}

/**
 * Marks an order paid without a bank, for the simulated flow. The server refuses this outright
 * once real merchant credentials exist, so it cannot survive into a system taking real cards.
 */
export function simulateMarketOrderPayment(id: number): Promise<MarketOrder> {
  return apiFetch<MarketOrder>(`/api/marketorders/${id}/simulate-payment`, { method: 'POST' });
}
