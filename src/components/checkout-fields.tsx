import { useLanguage } from '@/contexts/language-context';
import type { MarketListing } from '@/types/market-listing';

export type CheckoutValues = {
  name: string;
  surname: string;
  phone: string;
  city: string;
  village: string;
  address: string;
  facebookUrl: string;
  quantity: string;
};

export const EMPTY_CHECKOUT: CheckoutValues = {
  name: '',
  surname: '',
  phone: '',
  city: '',
  village: '',
  address: '',
  facebookUrl: '',
  quantity: '1',
};

type Props = {
  listing: MarketListing;
  values: CheckoutValues;
  onChange: (field: keyof CheckoutValues, value: string) => void;
};

export function CheckoutFields({ listing, values, onChange }: Props) {
  const { t } = useLanguage();

  return (
    <div className="checkout-fields">
      <div className="checkout-field-row">
        <label className="checkout-field">
          <span>{t('market.buyerName')}</span>
          <input
            value={values.name}
            onChange={(e) => onChange('name', e.target.value)}
            autoComplete="given-name"
            autoFocus
          />
        </label>

        <label className="checkout-field">
          <span>{t('market.buyerSurname')}</span>
          <input
            value={values.surname}
            onChange={(e) => onChange('surname', e.target.value)}
            autoComplete="family-name"
          />
        </label>
      </div>

      <label className="checkout-field">
        <span>{t('market.buyerPhone')}</span>
        <input
          value={values.phone}
          onChange={(e) => onChange('phone', e.target.value)}
          autoComplete="tel"
          inputMode="tel"
        />
      </label>

      <div className="checkout-field-row">
        <label className="checkout-field">
          <span>{t('market.buyerCity')}</span>
          <input
            value={values.city}
            onChange={(e) => onChange('city', e.target.value)}
            autoComplete="address-level2"
          />
        </label>

        <label className="checkout-field">
          <span>{t('market.buyerVillage')}</span>
          <input
            value={values.village}
            onChange={(e) => onChange('village', e.target.value)}
            autoComplete="address-level3"
          />
        </label>
      </div>

      <label className="checkout-field">
        <span>{t('market.buyerAddress')}</span>
        <input
          value={values.address}
          onChange={(e) => onChange('address', e.target.value)}
          autoComplete="street-address"
        />
      </label>

      <label className="checkout-field">
        <span>{t('market.buyerFacebook')}</span>
        <input
          value={values.facebookUrl}
          onChange={(e) => onChange('facebookUrl', e.target.value)}
          inputMode="url"
          placeholder="https://facebook.com/..."
        />
      </label>

      {listing.quantity != null && (
        <label className="checkout-field">
          <span>
            {t('market.checkoutQuantity')}
            {listing.priceUnit ? ` (${listing.priceUnit})` : ''}
          </span>
          <input
            type="number"
            step="0.01"
            min="0.01"
            max={listing.quantity}
            value={values.quantity}
            onChange={(e) => onChange('quantity', e.target.value)}
          />
        </label>
      )}
    </div>
  );
}
