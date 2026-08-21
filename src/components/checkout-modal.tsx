import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { CheckoutFields, EMPTY_CHECKOUT, type CheckoutValues } from '@/components/checkout-fields';
import { formatPrice } from '@/config/price';
import { useLanguage } from '@/contexts/language-context';
import { ApiError } from '@/services/api-client';
import { createMarketOrder } from '@/services/market-order-service';
import type { MarketListing } from '@/types/market-listing';
import './checkout-modal.css';

type Props = {
  listing: MarketListing;
  onClose: () => void;
};

/**
 * Collects what the seller needs to deliver to a stranger — who they are, how to reach them and
 * where they live — and hands off to the bank.
 *
 * The total shown here is worked out locally for the buyer's benefit only. The server prices the
 * order again from the listing and charges that; nothing typed in this form can set a price.
 *
 * Mounted only while it is open — the parent decides — so every checkout starts from a blank form
 * without this having to reset itself on the way in.
 */
export function CheckoutModal({ listing, onClose }: Props) {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [values, setValues] = useState<CheckoutValues>(EMPTY_CHECKOUT);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function change(field: keyof CheckoutValues, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  const parsedQuantity = Number(values.quantity.replace(',', '.'));
  const quantityValid =
    Number.isFinite(parsedQuantity) &&
    parsedQuantity > 0 &&
    (listing.quantity == null || parsedQuantity <= listing.quantity);
  const total = quantityValid ? listing.price * parsedQuantity : 0;

  const detailsValid =
    values.name.trim().length >= 2 &&
    values.surname.trim().length >= 2 &&
    values.phone.trim().length >= 5 &&
    values.city.trim().length >= 2 &&
    values.village.trim().length >= 2 &&
    values.address.trim().length >= 2;

  const canSubmit = detailsValid && quantityValid && !submitting;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setError(null);
    try {
      const facebookUrl = values.facebookUrl.trim();
      const order = await createMarketOrder({
        listingId: listing.id,
        buyerName: values.name.trim(),
        buyerSurname: values.surname.trim(),
        buyerPhone: values.phone.trim(),
        buyerCity: values.city.trim(),
        buyerVillage: values.village.trim(),
        buyerAddress: values.address.trim(),
        buyerFacebookUrl: facebookUrl === '' ? undefined : facebookUrl,
        quantity: parsedQuantity,
      });
      // Leaving for the bank's own page. A full navigation rather than a new tab: the buyer should
      // come back to this app afterwards, which is what the bank's redirect URLs arrange.
      if (order.simulated) {
        navigate(order.redirectUrl);
        return;
      }
      window.location.href = order.redirectUrl;
    } catch (err) {
      // 503 would mean the server cannot take payments at all. It no longer answers that — an
      // unconfigured server simulates instead — but the wording stays for the day it does again.
      setError(
        err instanceof ApiError && err.status === 503
          ? t('market.paymentUnavailable')
          : err instanceof Error && err.message
            ? err.message
            : t('market.checkoutError')
      );
      setSubmitting(false);
    }
  }

  return (
    <div className="checkout-overlay" onClick={onClose}>
      <form className="checkout-card" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <h2 className="checkout-title">{t('market.checkout')}</h2>

        <CheckoutFields listing={listing} values={values} onChange={change} />

        <div className="checkout-total">
          <span>{t('market.total')}</span>
          <strong>{formatPrice(total)}</strong>
        </div>

        <p className="checkout-hint">{t('market.checkoutHint')}</p>

        {error && <div className="error-banner">{error}</div>}

        <div className="checkout-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            {t('market.backToMarket')}
          </button>
          <button type="submit" className="btn" disabled={!canSubmit}>
            {submitting ? '…' : t('market.payWithCard')}
          </button>
        </div>
      </form>
    </div>
  );
}
