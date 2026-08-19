import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import marketIcon from '@/assets/market.png';
import { LanguageToggle } from '@/components/language-toggle';
import { ThemeToggle } from '@/components/theme-toggle';
import { LISTING_CATEGORY_OPTIONS, LISTING_TYPE_OPTIONS } from '@/config/market-listing';
import { useLanguage } from '@/contexts/language-context';
import { resolveAssetUrl } from '@/services/api-client';
import { getMarketListings } from '@/services/market-listing-service';
import type { ListingCategory, ListingType, MarketListing } from '@/types/market-listing';
import './home-page.css';

/** How long each photo holds before the next slides in, while the pointer is over a card. */
const SLIDE_INTERVAL_MS = 900;

/** Prices are stored and shown in GEL, as they are entered on the farm side. */
const PRICE_FORMAT = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'GEL',
  maximumFractionDigits: 2,
});

/** The main page: everything farmers have put up for sale or rent, three to a row, open to anyone. */
export function HomePage() {
  const { t } = useLanguage();

  const [listings, setListings] = useState<MarketListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<ListingCategory | ''>('');
  /** null is "all" — the absence of the filter rather than a type the server knows. */
  const [type, setType] = useState<ListingType | null>(null);

  /*
   * Category and type are refetched, search is not — the same split the web SPA makes. Each of
   * those is one click and one request; typing is a request per keystroke unless it is debounced,
   * and the rows needed to answer it are already here.
   */
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, type]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setListings(await getMarketListings({ category: category || undefined, type: type ?? undefined }));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  const term = search.trim().toLowerCase();
  const visibleListings = term
    ? listings.filter(
        (item) => item.title.toLowerCase().includes(term) || item.itemType.toLowerCase().includes(term)
      )
    : listings;

  return (
    <div className="home-page">
      {/* Title row and toolbar pin together as one block — see .home-sticky in home-page.css. */}
      <div className="home-sticky">
        <div className="home-header">
          <div className="home-title-row">
            {/* Decorative: the title says "market" right beside it, so a screen reader announcing
                the picture too would only say it twice. */}
            <img src={marketIcon} alt="" className="home-title-icon" />
            <h1 className="home-title">{t('market.title')}</h1>
            {/* Just the number, so it needs no wording and therefore no plural rule in three
                languages. The SPA does the same beside a page title it changes. */}
            {!loading && !error && <span className="home-count">{visibleListings.length}</span>}
          </div>

          <div className="topbar-actions">
            <ThemeToggle />
            <LanguageToggle />
          </div>
        </div>

        <div className="home-toolbar">
          {/* Buy or rent, as a segmented control rather than a third dropdown: it is the coarsest
              cut of the market and worth one click, not two. */}
          <div className="type-filter" role="group" aria-label={t('market.filterType')}>
            {LISTING_TYPE_OPTIONS.map((option) => (
              <button
                key={option.value ?? 'all'}
                type="button"
                className={type === option.value ? 'type-filter-item active' : 'type-filter-item'}
                aria-pressed={type === option.value}
                onClick={() => setType(option.value)}
              >
                {t(option.labelKey)}
              </button>
            ))}
          </div>

          <label className="search-field">
            <SearchIcon />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('market.searchPlaceholder')}
              aria-label={t('market.searchPlaceholder')}
            />
            {search && (
              <button
                type="button"
                className="search-clear"
                onClick={() => setSearch('')}
                aria-label={t('market.searchClear')}
              >
                ✕
              </button>
            )}
          </label>

          <span className="select-field">
            <select
              className="toolbar-select"
              value={category}
              onChange={(e) => setCategory(e.target.value as ListingCategory | '')}
              aria-label={t('market.categoryLabel')}
            >
              <option value="">{t('market.categoryAll')}</option>
              {LISTING_CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {t(option.labelKey)}
                </option>
              ))}
            </select>
            <span className="select-caret" aria-hidden="true">
              ▾
            </span>
          </span>
        </div>
      </div>

      {loading ? (
        <div className="state-box">…</div>
      ) : error ? (
        <div className="state-box">
          <span>{t('market.loadError')}</span>
          <span className="product-meta">{error}</span>
          <button type="button" className="btn btn-secondary" onClick={load}>
            {t('common.retry')}
          </button>
        </div>
      ) : visibleListings.length === 0 ? (
        <div className="state-box">
          {/* Nothing matched is a different situation from nothing being on offer, and only one of
              the two is worth offering a way out of. */}
          {listings.length === 0 ? t('market.empty') : t('market.noMatches')}
        </div>
      ) : (
        <div className="product-grid">
          {visibleListings.map((listing) => (
            <ProductCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <line x1="16.5" y1="16.5" x2="21" y2="21" strokeLinecap="round" />
    </svg>
  );
}

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

function ProductCard({ listing }: { listing: MarketListing }) {
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
    <Link to={`/listing/${listing.id}`} className="product-card">
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
          {PRICE_FORMAT.format(listing.price)}
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
