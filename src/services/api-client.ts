/**
 * The whole networking layer, as in the web SPA: no cache, no dedupe, no retry, no data-fetching
 * library. Pages hold their own rows, loading flag and error string.
 *
 * There is no token here and no Authorization header. This app only ever reads the market, and the
 * market's read endpoints are [AllowAnonymous] — see Server/Controllers/MarketListingsController.cs.
 * Anything that writes needs a signed-in caller, which is what the web SPA is for.
 */
export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5261';

/** Prefixes a server-relative `/uploads/...` path with the API host; passes absolute URLs through.
 *  Every <img src> for user content goes through this. */
export function resolveAssetUrl(path: string): string {
  if (!path || /^https?:\/\//.test(path)) {
    return path;
  }
  return `${API_URL}${path}`;
}

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new ApiError(response.status, body || response.statusText);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
