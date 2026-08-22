import { Link } from 'react-router-dom';

import { FARM_APP_URL } from '@/config/farm-app';
import { useAuth } from '@/contexts/auth-context';
import { useLanguage } from '@/contexts/language-context';
import './account-menu.css';

/** Who is signed in, or the way to be. Sits in the header beside the theme and language toggles. */
export function AccountMenu() {
  const { t } = useLanguage();
  const { user, isAuthenticated, signOut } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="account-menu">
        <Link to="/login" className="account-link">
          {t('auth.login')}
        </Link>
        <Link to="/register" className="account-link primary">
          {t('auth.register')}
        </Link>
      </div>
    );
  }

  return (
    <div className="account-menu">
      <Link to="/profile" className="account-name" title={user?.email}>
        {user?.sellerName?.trim() || user?.name}
      </Link>

      {/* Only for an account that actually has the farm software — for a shop registered here it
          would be a link to a sign-in it can never pass. A plain anchor, not a route: that app is
          a separate origin. */}
      {user?.hasManagementAccess && (
        <a className="account-link" href={FARM_APP_URL} rel="noreferrer">
          {t('auth.openFarm')}
        </a>
      )}

      <button type="button" className="account-link" onClick={signOut}>
        {t('auth.logout')}
      </button>
    </div>
  );
}
