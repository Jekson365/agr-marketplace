import { useLanguage } from '@/contexts/language-context';
import type { SellerProfile } from '@/types/auth';

type Props = {
  profile: SellerProfile;
  onChange: (profile: SellerProfile) => void;
};

/** The seller's own fields, in the order a buyer reads them: who, where, then how to reach them. */
export function ProfileFields({ profile, onChange }: Props) {
  const { t } = useLanguage();

  const field = (
    key: keyof SellerProfile,
    labelKey: string,
    options: { placeholder?: string; inputMode?: 'tel' } = {}
  ) => (
    <div className="profile-field">
      <label htmlFor={key}>{t(labelKey)}</label>
      <input
        id={key}
        value={profile[key]}
        onChange={(e) => onChange({ ...profile, [key]: e.target.value })}
        placeholder={options.placeholder ? t(options.placeholder) : undefined}
        inputMode={options.inputMode}
      />
    </div>
  );

  return (
    <>
      <div className="profile-section">{t('profile.sectionWho')}</div>
      <div className="profile-grid">
        {field('sellerName', 'profile.shopName', { placeholder: 'auth.sellerNamePlaceholder' })}
        {field('sellerLocation', 'profile.location', { placeholder: 'profile.locationPlaceholder' })}
        {field('name', 'profile.name')}
        {field('surname', 'profile.surname')}
      </div>

      <div className="profile-section">{t('profile.sectionContact')}</div>
      <div className="profile-grid">
        {field('sellerPhone', 'profile.phone', { placeholder: 'auth.sellerPhonePlaceholder', inputMode: 'tel' })}
        {field('sellerWhatsapp', 'profile.whatsapp', { placeholder: 'profile.whatsappPlaceholder', inputMode: 'tel' })}
        {field('sellerTelegram', 'profile.telegram', { placeholder: 'profile.telegramPlaceholder' })}
        {field('sellerFacebook', 'profile.facebook', { placeholder: 'profile.facebookPlaceholder' })}
      </div>
    </>
  );
}
