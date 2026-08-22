/**
 * Where the farm management software lives.
 *
 * A separate app on a separate origin, so the link out is a plain URL rather than a route — and
 * crossing origins means a separate sign-in there: each app keeps its own session in its own
 * `localStorage`, which is exactly why one can be a shop and the other a farm.
 *
 * Baked in at build time like {@link API_URL}; the default is the SPA's own dev port.
 */
export const FARM_APP_URL = import.meta.env.VITE_FARM_APP_URL ?? 'http://localhost:5173';
