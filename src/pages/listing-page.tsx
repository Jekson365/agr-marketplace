import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { CheckoutModal } from '@/components/checkout-modal';
import { ImageSlider } from '@/components/image-slider';
import { LanguageToggle } from '@/components/language-toggle';
import { ThemeToggle } from '@/components/theme-toggle';
import { mapsUrl, telegramUrl, whatsAppUrl } from '@/config/contact';
import { formatPrice } from '@/config/price';
import { LISTING_CATEGORY_LABEL_KEY } from '@/config/market-listing';
import { useLanguage } from '@/contexts/language-context';
import { ApiError, resolveAssetUrl } from '@/services/api-client';
import { getMarketListing } from '@/services/market-listing-service';
import type { MarketListing } from '@/types/market-listing';
import './listing-page.css';

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function BoxIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 8 12 3 3 8v8l9 5 9-5Z" />
      <path d="m3 8 9 5 9-5" />
      <path d="M12 13v8" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .3 1.9.6 2.8a2 2 0 0 1-.4 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.5 2.8.6a2 2 0 0 1 1.8 2Z" />
    </svg>
  );
}

/* The two brand marks, as their official single-path glyphs — filled, so they take the button's
   colour rather than needing one of their own. */
function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0 0 20.465 3.488" />
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

/** One listing in full: its photos, what it costs, what the seller wrote, and how to reach them. */
export function ListingPage() {
  const { t } = useLanguage();
  const { id: idParam } = useParams<{ id: string }>();
  const listingId = Number(idParam);

  const [listing, setListing] = useState<MarketListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  /** A listing that has been taken down is not a failure to load — it gets its own message and no
   *  retry button, since retrying will not bring it back. */
  const [missing, setMissing] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  useEffect(() => {
    if (!listingId) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listingId]);

  async function load() {
    setLoading(true);
    setError(null);
    setMissing(false);
    try {
      setListing(await getMarketListing(listingId));
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setMissing(true);
      } else {
        setError(err instanceof Error ? err.message : String(err));
      }
    } finally {
      setLoading(false);
    }
  }

  const typeLabel = listing?.itemType.trim()
    ? listing.itemType
    : listing && listing.category !== 'Other'
      ? t(LISTING_CATEGORY_LABEL_KEY[listing.category])
      : '';
  const title = listing ? listing.title.trim() || typeLabel || t('market.untitled') : '';
  const sellerName = listing ? [listing.sellerName, listing.sellerSurname].filter(Boolean).join(' ') : '';
  const isCompleted = listing?.status === 'Completed';

  return (
    <div className="listing-page">
      <div className="listing-topbar">
        <Link to="/" className="back-link">
          ← {t('market.back')}
        </Link>
        <div className="topbar-actions">
          <ThemeToggle />
          <LanguageToggle />
        </div>
      </div>

      {loading ? (
        <div className="state-box">…</div>
      ) : missing ? (
        <div className="state-box">{t('market.notFound')}</div>
      ) : error || !listing ? (
        <div className="state-box">
          <span>{t('market.loadError')}</span>
          <span className="listing-meta-note">{error}</span>
          <button type="button" className="btn btn-secondary" onClick={load}>
            {t('common.retry')}
          </button>
        </div>
      ) : (
        <>
          {listing.imagePaths.length > 0 ? (
            <ImageSlider images={listing.imagePaths.map(resolveAssetUrl)} />
          ) : (
            <div className="listing-hero-placeholder" aria-hidden="true">
              {title.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="listing-head">
            <h1 className="listing-title">{title}</h1>
            <span className="listing-head-badges">
              {listing.isPremium && <span className="listing-premium">★ {t('market.premium')}</span>}
              <span className={isCompleted ? 'listing-status completed' : 'listing-status'}>
                {isCompleted ? t('market.statusCompleted') : t('market.statusActive')}
              </span>
            </span>
          </div>

          <div className="listing-price-row">
            <span className="listing-price">{formatPrice(listing.price)}</span>
            {listing.priceUnit && <span className="listing-price-unit">/ {listing.priceUnit}</span>}
          </div>

          {/* Only what is still for sale can be bought — and only a sale, never a rental. Renting
              is arranged with the seller (dates, deposit, handover), none of which a one-off card
              charge captures, so a rental page offers the contact buttons below and no checkout.
              A completed listing loses the button too, and keeps the rest of its page. */}
          {!isCompleted && listing.type !== 'Rent' && listing.price > 0 && (
            <button type="button" className="btn listing-buy-button" onClick={() => setCheckoutOpen(true)}>
              {t('market.buy')}
            </button>
          )}

          {/* What kind of listing it is. Where it is and how much of it there is are facts about
              the thing itself, not labels on it, so they get the cards below rather than two more
              grey pills in this row. */}
          <div className="listing-chips">
            <span className="listing-chip">
              {listing.type === 'Rent' ? t('market.typeRent') : t('market.typeSale')}
            </span>
            {typeLabel && <span className="listing-chip">{typeLabel}</span>}
          </div>

          {(listing.location || listing.quantity != null) && (
            <div className="listing-info-grid">
              {listing.location && (
                /* Sellers type a place name, never coordinates, so the only thing to do with one
                   is hand it to a map as a search. Opens in its own tab — losing the listing you
                   were reading is not a fair price for checking where it is. */
                <a
                  className="listing-info-card"
                  href={mapsUrl(listing.location)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="listing-info-icon" aria-hidden="true">
                    <PinIcon />
                  </span>
                  <span className="listing-info-body">
                    <span className="listing-info-label">{t('market.location')}</span>
                    <span className="listing-info-value">{listing.location}</span>
                  </span>
                  <span className="listing-info-go" aria-hidden="true">
                    ↗
                  </span>
                </a>
              )}

              {listing.quantity != null && (
                <div className="listing-info-card">
                  <span className="listing-info-icon amount" aria-hidden="true">
                    <BoxIcon />
                  </span>
                  <span className="listing-info-body">
                    <span className="listing-info-label">{t('market.amount')}</span>
                    {/* The label says what the number is, so the number can just be the number —
                        no need for the grid's "N unit left" phrasing here. */}
                    <span className="listing-info-value">
                      {listing.quantity}
                      {listing.priceUnit ? ` ${listing.priceUnit}` : ''}
                    </span>
                  </span>
                </div>
              )}
            </div>
          )}

          {listing.description && (
            <section className="listing-section">
              <h2 className="listing-section-label">{t('market.description')}</h2>
              <p className="listing-description">{listing.description}</p>
            </section>
          )}

          <section className="listing-section">
            <h2 className="listing-section-label">{t('market.seller')}</h2>
            <div className="listing-seller-card">
              <div className="listing-seller-avatar">
                {listing.sellerImagePath ? (
                  <img src={resolveAssetUrl(listing.sellerImagePath)} alt="" />
                ) : (
                  <span aria-hidden="true">{(sellerName || '?').charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="listing-seller-info">
                <div className="listing-seller-name">{sellerName}</div>
                {listing.sellerPhoneNumber && <div className="listing-seller-phone">{listing.sellerPhoneNumber}</div>}
              </div>
            </div>

            {/* All three hang off the same phone number, so they appear and disappear together.
                WhatsApp and Telegram are proper nouns and stay in Latin script in every locale,
                which is why they are not translation keys. */}
            {listing.sellerPhoneNumber && (
              <div className="listing-contact-row">
                <a href={`tel:${listing.sellerPhoneNumber}`} className="contact-button call">
                  <PhoneIcon />
                  {t('market.call')}
                </a>
                {whatsAppUrl(listing.sellerPhoneNumber) && (
                  <a
                    href={whatsAppUrl(listing.sellerPhoneNumber)!}
                    className="contact-button whatsapp"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <WhatsAppIcon />
                    WhatsApp
                  </a>
                )}
                {telegramUrl(listing.sellerPhoneNumber) && (
                  <a
                    href={telegramUrl(listing.sellerPhoneNumber)!}
                    className="contact-button telegram"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <TelegramIcon />
                    Telegram
                  </a>
                )}
              </div>
            )}
          </section>

          {checkoutOpen && <CheckoutModal listing={listing} onClose={() => setCheckoutOpen(false)} />}
        </>
      )}
    </div>
  );
}
