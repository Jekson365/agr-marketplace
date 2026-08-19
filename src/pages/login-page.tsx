import { useState } from 'react';

import { login } from '@/services/auth-service';
import { ApiError } from '@/services/api-client';
import type { Session } from '@/session';
import './login-page.css';

type Props = {
  onSignedIn: (session: Session) => void;
};

/**
 * Signing in exists here only because the main grid is "the products *you* uploaded" — the
 * listings endpoint needs a bearer token before it can say who that is. This app runs on its own
 * origin, so it cannot see the web SPA's stored session and has to ask for its own.
 */
export function LoginPage({ onSignedIn }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = email.trim().length > 0 && password.length > 0 && !submitting;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setError(null);
    try {
      const response = await login({ email: email.trim(), password });
      onSignedIn({ token: response.token, user: response.user });
    } catch (err) {
      // A wrong email or password comes back 401; anything else is worth showing as it arrived.
      setError(
        err instanceof ApiError && err.status === 401
          ? 'That email and password did not match an account.'
          : err instanceof Error
            ? err.message
            : String(err)
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1 className="login-title">Marketplace</h1>
        <p className="login-intro">Sign in with your farm account to see the products you uploaded.</p>

        <div className="login-fields">
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <div className="error-banner">{error}</div>}

          <button type="submit" className="btn" disabled={!canSubmit}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </div>
      </form>
    </div>
  );
}
