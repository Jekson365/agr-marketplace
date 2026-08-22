import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { setAuthToken } from '@/services/api-client';
import * as authService from '@/services/auth-service';
import { clearSession, loadSession, saveSession } from '@/services/token-storage';
import type { LoginRequest, SellerAccountRequest, User } from '@/types/auth';

type AuthContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  signIn: (request: LoginRequest) => Promise<void>;
  /** Signing up from here always creates a seller, and never a farm account. */
  signUp: (request: SellerAccountRequest) => Promise<void>;
  signOut: () => void;
  /** Replaces the stored user after a profile save, so the header and the form agree at once. */
  refreshUser: (user: User) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Who is signed in, if anyone.
 *
 * The market itself needs none of this — browsing and ordering are open, and stay that way. The
 * session is for the account: registering as a seller, and being recognised afterwards.
 *
 * Restored synchronously during the first render rather than in an effect, so a refresh never
 * paints a signed-out header for a moment before correcting itself.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = loadSession();
    if (stored) setAuthToken(stored.token);
    return stored?.user ?? null;
  });

  // Covers a session cleared in another tab: the module-level token would otherwise still be set.
  useEffect(() => {
    if (!user) setAuthToken(null);
  }, [user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user != null,
      signIn: async (request) => {
        const session = await authService.login(request);
        setAuthToken(session.token);
        saveSession(session);
        setUser(session.user);
      },
      signUp: async (request) => {
        const session = await authService.registerSeller(request);
        setAuthToken(session.token);
        saveSession(session);
        setUser(session.user);
      },
      signOut: () => {
        setAuthToken(null);
        clearSession();
        setUser(null);
      },
      refreshUser: (next) => {
        const stored = loadSession();
        if (stored) saveSession({ ...stored, user: next });
        setUser(next);
      },
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
