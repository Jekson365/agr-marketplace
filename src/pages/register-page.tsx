import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';

import marketIcon from '@/assets/market.png';
import { useAuth } from '@/contexts/auth-context';
import { useLanguage } from '@/contexts/language-context';
import { ApiError } from '@/services/api-client';
import './auth-page.css';

const MIN_PASSWORD = 6;

/**
 * Registering to sell here.
 *
 * The account lands in the same table the farm software signs into, so one email is one account
 * either way — but an account made here is a seller and has no access to the farm software, which
 * is what keeps a shop from being handed a farm it never asked for.
 */
export function RegisterPage() {
  const { t } = useLanguage();
  const { signUp, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [sellerName, setSellerName] = useState('');
  const [sellerPhone, setSellerPhone] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const canSubmit =
    sellerName.trim().length >= 2 &&
    name.trim() !== '' &&
    email.trim() !== '' &&
    password.length >= MIN_PASSWORD &&
    !submitting;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setError(null);
    try {
      await signUp({
        name: name.trim(),
        email: email.trim(),
        password,
        sellerName: sellerName.trim(),
        sellerPhone: sellerPhone.trim(),
      });
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof ApiError && err.status === 409 ? t('auth.errorEmailTaken') : t('auth.errorGeneric'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="auth-brand">
          <img src={marketIcon} alt="" />
          <h1 className="auth-title">{t('auth.registerTitle')}</h1>
        </div>
        <p className="auth-lead">{t('auth.registerLead')}</p>

        <div className="auth-fields">
          <div className="auth-field">
            <label htmlFor="sellerName">{t('auth.sellerName')}</label>
            <input
              id="sellerName"
              value={sellerName}
              onChange={(e) => setSellerName(e.target.value)}
              placeholder={t('auth.sellerNamePlaceholder')}
            />
          </div>

          <div className="auth-field">
            <label htmlFor="sellerPhone">{t('auth.sellerPhone')}</label>
            <input
              id="sellerPhone"
              value={sellerPhone}
              onChange={(e) => setSellerPhone(e.target.value)}
              placeholder={t('auth.sellerPhonePlaceholder')}
              inputMode="tel"
            />
          </div>

          <div className="auth-field">
            <label htmlFor="name">{t('auth.fullName')}</label>
            <input id="name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
          </div>

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
              autoComplete="new-password"
            />
          </div>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <button type="submit" className="auth-submit" disabled={!canSubmit}>
          {submitting ? t('auth.creating') : t('auth.register')}
        </button>

        <p className="auth-switch">
          {t('auth.haveAccount')} <Link to="/login">{t('auth.login')}</Link>
        </p>

        <Link to="/" className="auth-back">
          ← {t('market.backToMarket')}
        </Link>
      </form>
    </div>
  );
}
