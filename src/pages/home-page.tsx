import { useEffect, useState } from 'react';

import { resolveAssetUrl } from '@/services/api-client';
import { getMarketListings } from '@/services/market-listing-service';
import type { MarketListing } from '@/types/market-listing';
import type { User } from '@/types/auth';
import './home-page.css';

type Props = {
  user: User;
  onSignOut: () => void;
};

/** Prices are stored and shown in GEL, as they are entered on the farm side. */
const PRICE_FORMAT = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'GEL',
  maximumFractionDigits: 2,
});

/** The main page: everything the signed-in user has put up for sale or rent, three to a row. */
export function HomePage({ user, onSignOut }: Props) {
  const [listings, setListings] = useState<MarketListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      // `mine` is what makes this the user's own uploads rather than the whole market.
      setListings(await getMarketListings({ mine: true }));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="home-page">
      <div className="home-header">
        <h1 className="home-title">Marketplace</h1>

        <div className="home-user">
          {user.imagePath && <img src={resolveAssetUrl(user.imagePath)} alt="" className="home-user-avatar" />}
          <span className="home-user-name">
            {user.name} {user.surname}
          </span>
          <button type="button" className="btn btn-secondary" onClick={onSignOut}>
            Sign out
          </button>
        </div>
      </div>

      <p className="home-subtitle">
        {loading || error ? 'Products you uploaded' : `${listings.length} product${listings.length === 1 ? '' : 's'} you uploaded`}
      </p>

      {loading ? (
        <div className="state-box">Loading…</div>
      ) : error ? (
        <div className="state-box">
          <span>Could not load your products.</span>
          <span className="product-meta">{error}</span>
          <button type="button" className="btn btn-secondary" onClick={load}>
            Try again
          </button>
        </div>
      ) : listings.length === 0 ? (
        <div className="state-box">You have not uploaded any products yet.</div>
      ) : (
        <div className="product-grid">
          {listings.map((listing) => (
            <ProductCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProductCard({ listing }: { listing: MarketListing }) {
  const cover = listing.imagePaths[0];
  // A listing may be saved without a title, in which case the item type is what names it.
  const title = listing.title.trim() || listing.itemType || 'Untitled';
  const isSold = listing.status === 'Completed';

  return (
    <article className="product-card">
      <div className="product-image-wrap">
        {cover ? (
          <img src={resolveAssetUrl(cover)} alt="" className="product-image" />
        ) : (
          <div className="product-image-fallback" aria-hidden="true">
            {title.charAt(0).toUpperCase()}
          </div>
        )}

        <span className={isSold ? 'product-status sold' : 'product-status'}>
          {isSold ? 'Sold' : listing.type === 'Rent' ? 'For rent' : 'For sale'}
        </span>

        {listing.imagePaths.length > 1 && <span className="product-photo-count">{listing.imagePaths.length} photos</span>}
      </div>

      <div className="product-info">
        <div className="product-title" title={title}>
          {title}
        </div>
        <div className="product-price">
          {PRICE_FORMAT.format(listing.price)}
          {listing.priceUnit ? ` / ${listing.priceUnit}` : ''}
        </div>
        {listing.quantity != null && (
          <div className="product-meta">
            {listing.quantity} {listing.priceUnit} left
          </div>
        )}
        {listing.location && <div className="product-meta">{listing.location}</div>}
      </div>
    </article>
  );
}
