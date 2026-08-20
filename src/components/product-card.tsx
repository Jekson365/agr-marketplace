import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { formatPrice } from '@/config/price';
import { useLanguage } from '@/contexts/language-context';
import { resolveAssetUrl } from '@/services/api-client';
import type { MarketListing } from '@/types/market-listing';
import './product-card.css';

/** How long each photo holds before the next slides in, while the pointer is over a card. */
const SLIDE_INTERVAL_MS = 900;

function BoxIcon() {
  return (
    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 8 12 3 3 8v8l9 5 9-5Z" />
      <path d="m3 8 9 5 9-5" />
      <path d="M12 13v8" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

export function ProductCard({ listing }: { listing: MarketListing }) {
  const { t } = useLanguage();

  const images = listing.imagePaths;
  // A listing may be saved without a title, in which case the item type is what names it.
  const title = listing.title.trim() || listing.itemType || t('market.untitled');
  const isSold = listing.status === 'Completed';

  const [hovered, setHovered] = useState(false);
  const [index, setIndex] = useState(0);

  /* The photos advance only under the pointer, so a grid at rest is still — a dozen cards all
     cycling at once would be a page nobody can read. The timer is torn down on the way out. */
  useEffect(() => {
    if (!hovered || images.length < 2) return;
    const timer = setInterval(() => setIndex((prev) => (prev + 1) % images.length), SLIDE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [hovered, images.length]);

  function handleLeave() {
    setHovered(false);
    // Back to the cover, so a card looks the same on the way out as it did before it was touched.
    setIndex(0);
  }

  return (
    /* The whole card is the link, so the target is the tile rather than the title inside it — and
       it is a real <a>, so middle-click and "open in new tab" work as they would anywhere. */
    <Link to={`/listing/${listing.id}`} className={listing.isPremium ? 'product-card premium' : 'product-card'}>
      <div className="product-image-wrap" onMouseEnter={() => setHovered(true)} onMouseLeave={handleLeave}>
        {images.length > 0 ? (
          /* One row of full-width photos, slid sideways a whole photo at a time. Translating a
             track keeps the neighbours mounted, so the next one is already decoded when it
             arrives rather than popping in as a fresh <img> would. */
          <div className="product-image-track" style={{ transform: `translateX(-${index * 100}%)` }}>
            {images.map((path, i) => (
              <img
                key={`${i}-${path}`}
                src={resolveAssetUrl(path)}
                alt=""
                className="product-image"
                /* Only the cover is on screen at rest; the rest cost nothing until hovered. */
                loading={i === 0 ? 'eager' : 'lazy'}
              />
            ))}
          </div>
        ) : (
          <div className="product-image-fallback" aria-hidden="true">
            {title.charAt(0).toUpperCase()}
          </div>
        )}

        <span className={isSold ? 'product-status sold' : 'product-status'}>
          {isSold ? t('market.sold') : listing.type === 'Rent' ? t('market.typeRent') : t('market.typeSale')}
        </span>

        {/* Opposite corner from the sale/rent badge, so the two never collide. */}
        {listing.isPremium && <span className="product-premium">★ {t('market.premium')}</span>}

        {images.length > 1 && (
          <>
            {/* The count says how many there are; the dots say which one you are looking at. They
                occupy the same corner of the card, so they trade places on hover. */}
            <span className="product-photo-count">{t('market.photos', { count: images.length })}</span>
            <div className="product-dots" aria-hidden="true">
              {images.map((path, i) => (
                <span key={`${i}-${path}`} className={i === index ? 'product-dot active' : 'product-dot'} />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="product-info">
        <div className="product-title" title={title}>
          {title}
        </div>
        <div className="product-price">
          {formatPrice(listing.price)}
          {listing.priceUnit ? ` / ${listing.priceUnit}` : ''}
        </div>
        {/* Both lines are rendered whether or not the listing fills them, so every card in a row is
            the same height and the grid stays even. CSS holds each open. */}
        {/* Amount and place read as a matched pair: same shape, same icon slot, told apart by
            colour rather than by squinting at two identical grey lines. */}
        <div className="product-meta balance">
          {listing.quantity != null && (
            <>
              <BoxIcon />
              <span className="product-place-text">
                {t('market.balanceLeft', { amount: listing.quantity, unit: listing.priceUnit })}
              </span>
            </>
          )}
        </div>
        {/* A pin, so the place is distinguishable at a glance from the balance line above it —
            two grey lines of the same size otherwise read as one block of small print. */}
        <div className="product-meta place">
          {listing.location && (
            <>
              <PinIcon />
              <span className="product-place-text">{listing.location}</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
