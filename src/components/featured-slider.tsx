import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { formatPrice } from '@/config/price';
import { useLanguage } from '@/contexts/language-context';
import { resolveAssetUrl } from '@/services/api-client';
import type { MarketListing } from '@/types/market-listing';
import './featured-slider.css';

const FEATURED_COUNT = 5;
const AUTOPLAY_MS = 5000;

type Props = {
  listings: MarketListing[];
};

function ChevronLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function shuffle(listings: MarketListing[]): MarketListing[] {
  const copy = [...listings];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pickFeatured(listings: MarketListing[]): MarketListing[] {
  const withPhoto = shuffle(listings.filter((listing) => listing.imagePaths.length > 0));
  if (withPhoto.length >= FEATURED_COUNT) {
    return withPhoto.slice(0, FEATURED_COUNT);
  }
  const withoutPhoto = shuffle(listings.filter((listing) => listing.imagePaths.length === 0));
  return [...withPhoto, ...withoutPhoto].slice(0, FEATURED_COUNT);
}

export function FeaturedSlider({ listings }: Props) {
  const slides = useMemo(() => pickFeatured(listings), [listings]);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || slides.length < 2) {
      return;
    }
    const timer = setInterval(() => setIndex((prev) => (prev + 1) % slides.length), AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [paused, slides.length]);

  if (slides.length === 0) {
    return null;
  }

  const active = Math.min(index, slides.length - 1);

  function goTo(next: number) {
    setIndex((next + slides.length) % slides.length);
  }

  return (
    <section
      className="featured-slider"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="featured-track" style={{ transform: `translateX(-${active * 100}%)` }}>
        {slides.map((listing, i) => (
          <FeaturedSlide key={listing.id} listing={listing} active={i === active} />
        ))}
      </div>

      {slides.length > 1 && (
        <>
          <button
            type="button"
            className="featured-arrow prev"
            onClick={() => goTo(active - 1)}
            aria-label="Previous product"
          >
            <ChevronLeftIcon />
          </button>
          <button
            type="button"
            className="featured-arrow next"
            onClick={() => goTo(active + 1)}
            aria-label="Next product"
          >
            <ChevronRightIcon />
          </button>

          <div className="featured-dots">
            {slides.map((listing, i) => (
              <button
                key={listing.id}
                type="button"
                className={i === active ? 'featured-dot active' : 'featured-dot'}
                onClick={() => goTo(i)}
                aria-label={`Product ${i + 1}`}
                aria-current={i === active ? 'true' : undefined}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function FeaturedSlide({ listing, active }: { listing: MarketListing; active: boolean }) {
  const { t } = useLanguage();

  const cover = listing.imagePaths[0];
  const title = listing.title.trim() || listing.itemType || t('market.untitled');

  return (
    <Link to={`/listing/${listing.id}`} className="featured-slide" tabIndex={active ? 0 : -1}>
      {cover ? (
        <img src={resolveAssetUrl(cover)} alt="" className="featured-photo" />
      ) : (
        <div className="featured-fallback" aria-hidden="true">
          {title.charAt(0).toUpperCase()}
        </div>
      )}

      <span className="featured-type">
        {listing.type === 'Rent' ? t('market.typeRent') : t('market.typeSale')}
      </span>
      {listing.isPremium && <span className="featured-premium">★ {t('market.premium')}</span>}

      <div className="featured-caption">
        <div className="featured-text">
          <div className="featured-title">{title}</div>
          {listing.location && <div className="featured-location">{listing.location}</div>}
        </div>
        <div className="featured-price">
          {formatPrice(listing.price)}
          {listing.priceUnit ? ` / ${listing.priceUnit}` : ''}
        </div>
      </div>
    </Link>
  );
}
