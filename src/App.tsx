import { useState } from 'react';

import { HomePage } from '@/pages/home-page';
import { LoginPage } from '@/pages/login-page';
import { clearSession, loadSession, saveSession, type Session } from '@/session';

/**
 * One page, so there is no router: either there is a session and you are looking at your products,
 * or there isn't and you are signing in. The stored session is read in the initialiser rather than
 * in an effect, so a returning visitor never sees the login form flash first.
 */
export function App() {
  const [session, setSession] = useState<Session | null>(() => loadSession());

  function handleSignedIn(next: Session) {
    saveSession(next);
    setSession(next);
  }

  function handleSignOut() {
    clearSession();
    setSession(null);
  }

  if (!session) {
    return <LoginPage onSignedIn={handleSignedIn} />;
  }

  return <HomePage user={session.user} onSignOut={handleSignOut} />;
}
