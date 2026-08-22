import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';

import marketIcon from '@/assets/market.png';
import { useAuth } from '@/contexts/auth-context';
import { useLanguage } from '@/contexts/language-context';
import { ApiError } from '@/services/api-client';
import './auth-page.css';

/** Signing in to the marketplace. The same account the farm software uses, since there is one
 *  user table behind both — a farmer who also sells signs in here with what they already have. */
export function LoginPage() {
  const { t } = useLanguage();
  const { signIn, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const canSubmit = email.trim() !== '' && password !== '' && !submitting;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setError(null);
    try {
      await signIn({ email: email.trim(), password });
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof ApiError && err.status === 401 ? t('auth.errorCredentials') : t('auth.errorGeneric'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="auth-brand">
          <img src={marketIcon} alt="" />
          <h1 className="auth-title">{t('auth.loginTitle')}</h1>
        </div>
        <p className="auth-lead">{t('auth.loginLead')}</p>

        <div className="auth-fields">
          <div className="auth-field">
            <label htmlFor="email">{t('auth.email')}</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          </div>

          <div className="auth-field">
            <label htmlFor="password">{t('auth.password')}</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <button type="submit" className="auth-submit" disabled={!canSubmit}>
          {submitting ? t('auth.signingIn') : t('auth.login')}
        </button>

        <p className="auth-switch">
          {t('auth.noAccount')} <Link to="/register">{t('auth.register')}</Link>
        </p>

        <Link to="/" className="auth-back">
          ← {t('market.backToMarket')}
        </Link>
      </form>
    </div>
  );
}
