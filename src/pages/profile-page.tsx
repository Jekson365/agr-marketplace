import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';

import marketIcon from '@/assets/market.png';
import { LanguageToggle } from '@/components/language-toggle';
import { ProfileFields } from '@/components/profile-fields';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuth } from '@/contexts/auth-context';
import { useLanguage } from '@/contexts/language-context';
import { getSellerProfile, updateSellerProfile } from '@/services/seller-service';
import type { SellerProfile } from '@/types/auth';
import './profile-page.css';

const EMPTY: SellerProfile = {
  sellerName: '',
  name: '',
  surname: '',
  sellerPhone: '',
  sellerTelegram: '',
  sellerWhatsapp: '',
  sellerFacebook: '',
  sellerLocation: '',
};

/**
 * The seller's own profile: who they are, where they trade from, and every way a buyer can reach
 * them. Read from the server on open rather than from the stored session, which is only as new as
 * the last sign-in.
 */
export function ProfilePage() {
  const { t } = useLanguage();
  const { isAuthenticated, refreshUser } = useAuth();

  const [profile, setProfile] = useState<SellerProfile>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;

    getSellerProfile()
      .then((user) => {
        if (cancelled) return;
        setProfile({
          sellerName: user.sellerName ?? '',
          name: user.name ?? '',
          surname: user.surname ?? '',
          sellerPhone: user.sellerPhone ?? '',
          sellerTelegram: user.sellerTelegram ?? '',
          sellerWhatsapp: user.sellerWhatsapp ?? '',
          sellerFacebook: user.sellerFacebook ?? '',
          sellerLocation: user.sellerLocation ?? '',
        });
      })
      .catch(() => !cancelled && setError(t('profile.loadError')))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const canSave = profile.sellerName.trim().length >= 2 && !saving;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSave) return;

    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const updated = await updateSellerProfile(profile);
      refreshUser(updated);
      setSaved(true);
    } catch {
      setError(t('profile.saveError'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="profile-page">
      <header className="profile-header">
        <Link to="/" className="profile-brand">
          <img src={marketIcon} alt="" />
          <span>{t('market.title')}</span>
        </Link>
        <div className="topbar-actions">
          <ThemeToggle />
          <LanguageToggle />
        </div>
      </header>

      <main className="profile-main">
        <h1 className="profile-title">{t('profile.title')}</h1>
        <p className="profile-lead">{t('profile.lead')}</p>

        {loading ? (
          <div className="profile-state">…</div>
        ) : (
          <form className="profile-card" onSubmit={handleSubmit}>
            <ProfileFields
              profile={profile}
              onChange={(next) => {
                setProfile(next);
                setSaved(false);
              }}
            />

            {error && <div className="profile-error">{error}</div>}
            {saved && !error && <div className="profile-saved">{t('profile.saved')}</div>}

            <button type="submit" className="profile-submit" disabled={!canSave}>
              {saving ? t('profile.saving') : t('profile.save')}
            </button>
          </form>
        )}

        <Link to="/" className="profile-back">
          ← {t('market.backToMarket')}
        </Link>
      </main>
    </div>
  );
}
