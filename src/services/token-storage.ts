import type { AuthResponse } from '@/types/auth';

/* Its own key, and on its own port its own storage: a session made in the farm SPA is invisible
   here and vice versa. Signing in happens once per app, deliberately. */
const STORAGE_KEY = 'marketplace.auth.session';

export function loadSession(): AuthResponse | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthResponse) : null;
  } catch {
    // A half-written or hand-edited value should read as "signed out", not crash the app.
    return null;
  }
}

export function saveSession(session: AuthResponse): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  localStorage.removeItem(STORAGE_KEY);
}
