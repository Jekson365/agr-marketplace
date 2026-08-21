import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { useLanguage } from '@/contexts/language-context';
import { getMarketOrder } from '@/services/market-order-service';
import type { MarketOrder } from '@/types/market-order';
import './checkout-return-page.css';

/** How often to re-ask while an order is still Pending, and for how long before giving up. */
const POLL_INTERVAL_MS = 2500;
const POLL_ATTEMPTS = 8;

/**
 * Where the bank sends the buyer back to.
 *
 * The route it lands on — /checkout/success or /checkout/fail — is **not** treated as the answer.
 * It is only where the buyer was sent, and anyone can type that address; the money is a fact the
 * server learns from the bank's signed callback and nowhere else. So this page ignores the route
 * entirely and asks the server what the order actually says.
 *
 * The callback and the buyer's browser race, and the browser often wins. A Pending order is
 * therefore re-checked a few times before the page settles for saying so.
 */
export function CheckoutReturnPage() {
  const { t } = useLanguage();
  const [params] = useSearchParams();
  const orderId = Number(params.get('order'));
  /** Set by the server when it had no merchant credentials, so no bank was ever involved. */
  const simulated = params.get('simulate') === '1';

  const [order, setOrder] = useState<MarketOrder | null>(null);
  /* Nothing to wait for without an order id, so that case starts settled rather than starting
     "loading" and being corrected on the first effect. */
  const [loading, setLoading] = useState(Boolean(orderId));
  const attemptsRef = useRef(0);

  useEffect(() => {
    if (!orderId) return;

    let cancelled = false;
    let timer: number | undefined;

    async function check() {
      try {
        const found = await getMarketOrder(orderId);
        if (cancelled) return;
        setOrder(found);
        setLoading(false);

        attemptsRef.current += 1;
        if (found.status === 'Pending' && attemptsRef.current < POLL_ATTEMPTS) {
          timer = window.setTimeout(check, POLL_INTERVAL_MS);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    }

    check();
    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [orderId, simulated]);

  const status = order?.status ?? 'Failed';
  const heading =
    status === 'Paid'
      ? t('market.paidTitle')
      : status === 'Pending'
        ? t('market.pendingTitle')
        : t('market.failedTitle');
  const body =
    status === 'Paid'
      ? t('market.paidBody')
      : status === 'Pending'
        ? t('market.pendingBody')
        : t('market.failedBody');

  return (
    <div className="checkout-return-page">
      <div className={`checkout-return-card ${status.toLowerCase()}`}>
        <div className="checkout-return-mark" aria-hidden="true">
          {loading ? '…' : status === 'Paid' ? '✓' : status === 'Pending' ? '⋯' : '✕'}
        </div>
        <h1 className="checkout-return-title">{loading ? '…' : heading}</h1>
        {!loading && <p className="checkout-return-body">{body}</p>}
        {!loading && order && (
          <p className="checkout-return-meta">
            #{order.id} · {order.amount} {order.currency}
          </p>
        )}

        {/* The split, shown only for a pretend sale. On a real one this is the platform's and the
            seller's business, not the buyer's. */}
        {!loading && simulated && order?.status === 'Paid' && (
          <div className="checkout-split">
            <div className="checkout-split-title">{t('market.simulatedTitle')}</div>
            <p className="checkout-split-body">{t('market.simulatedBody')}</p>
            <div className="checkout-split-row">
              <span>
                {t('market.platformFee')} ({(order.commissionRate * 100).toFixed(1)}%)
              </span>
              <strong>
                {order.platformFee.toFixed(2)} {order.currency}
              </strong>
            </div>
            <div className="checkout-split-row">
              <span>{t('market.sellerGets')}</span>
              <strong>
                {order.sellerAmount.toFixed(2)} {order.currency}
              </strong>
            </div>
          </div>
        )}
        <Link to="/" className="btn checkout-return-back">
          {t('market.backToMarket')}
        </Link>
      </div>
    </div>
  );
}
