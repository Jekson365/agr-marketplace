import { setAuthToken } from '@/services/api-client';
import type { User } from '@/types/auth';

export type Session = { token: string; user: User };

const STORAGE_KEY = 'marketplace.auth.session';

/**
 * The web SPA's key. Read as a fallback so that if this app is ever served from the same origin
 * as the SPA, someone already signed in there lands straight on their listings instead of a login
 * form. On its own port the two origins have separate storage and this simply finds nothing.
 */
const WEB_STORAGE_KEY = 'farm.auth.session';

/** Reads whichever session is on hand and arms the API client with its token. Returns null when
 *  there is none, or when what is stored is not a session (hand-edited, or from an older shape). */
export function loadSession(): Session | null {
  for (const key of [STORAGE_KEY, WEB_STORAGE_KEY]) {
    const raw = localStorage.getItem(key);
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw) as Partial<Session>;
      if (typeof parsed?.token === 'string' && parsed.user) {
        const session = { token: parsed.token, user: parsed.user };
        setAuthToken(session.token);
        return session;
      }
    } catch {
      // Unreadable: fall through to the next key, and to signed-out if there is none.
    }
  }
  setAuthToken(null);
  return null;
}

export function saveSession(session: Session): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  setAuthToken(session.token);
}

/** Clears this app's session only — a session belonging to the SPA is the SPA's to end. */
export function clearSession(): void {
  localStorage.removeItem(STORAGE_KEY);
  setAuthToken(null);
}
