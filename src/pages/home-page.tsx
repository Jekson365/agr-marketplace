import { useEffect, useState } from 'react';

import marketIcon from '@/assets/market.png';
import { FeaturedSlider } from '@/components/featured-slider';
import { LanguageToggle } from '@/components/language-toggle';
import { ProductCard } from '@/components/product-card';
import { ThemeToggle } from '@/components/theme-toggle';
import { LISTING_CATEGORY_OPTIONS, LISTING_TYPE_OPTIONS } from '@/config/market-listing';
import { useLanguage } from '@/contexts/language-context';
import { getMarketListings } from '@/services/market-listing-service';
import type { ListingCategory, ListingType, MarketListing } from '@/types/market-listing';
import './home-page.css';

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

      {!loading && !error && !term && <FeaturedSlider listings={listings} />}

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
