import { useState } from 'react';

import { useLanguage } from '@/contexts/language-context';
import { ApiError } from '@/services/api-client';
import { createMarketOrder } from '@/services/market-order-service';
import type { MarketListing } from '@/types/market-listing';
import './checkout-modal.css';

type Props = {
  listing: MarketListing;
  onClose: () => void;
};

const PRICE_FORMAT = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'GEL',
  maximumFractionDigits: 2,
});

/**
 * Collects the little the market needs to sell something to a stranger — a name, a phone number
 * and how much — and hands off to the bank.
 *
 * The total shown here is worked out locally for the buyer's benefit only. The server prices the
 * order again from the listing and charges that; nothing typed in this form can set a price.
 *
 * Mounted only while it is open — the parent decides — so every checkout starts from a blank form
 * without this having to reset itself on the way in.
 */
export function CheckoutModal({ listing, onClose }: Props) {
  const { t } = useLanguage();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parsedQuantity = Number(quantity.replace(',', '.'));
  const quantityValid =
    Number.isFinite(parsedQuantity) &&
    parsedQuantity > 0 &&
    (listing.quantity == null || parsedQuantity <= listing.quantity);
  const total = quantityValid ? listing.price * parsedQuantity : 0;

  const canSubmit = name.trim().length >= 2 && phone.trim().length >= 5 && quantityValid && !submitting;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setError(null);
    try {
      const order = await createMarketOrder({
        listingId: listing.id,
        buyerName: name.trim(),
        buyerPhone: phone.trim(),
        quantity: parsedQuantity,
      });
      // Leaving for the bank's own page. A full navigation rather than a new tab: the buyer should
      // come back to this app afterwards, which is what the bank's redirect URLs arrange.
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

        <div className="checkout-fields">
          <label className="checkout-field">
            <span>{t('market.buyerName')}</span>
            <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" autoFocus />
          </label>

          <label className="checkout-field">
            <span>{t('market.buyerPhone')}</span>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" inputMode="tel" />
          </label>

          {/* Only offered when the seller said how much there is. An uncounted listing is one lot. */}
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
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </label>
          )}
        </div>

        <div className="checkout-total">
          <span>{t('market.total')}</span>
          <strong>{PRICE_FORMAT.format(total)}</strong>
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
