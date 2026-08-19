# marketplace

A standalone React + Vite app that shows the products the signed-in user has uploaded to the farm
marketplace, three to a row.

```bash
cd marketplace
npm install
npm run dev       # http://localhost:5174, expects the API at http://localhost:5261
npm run build     # tsc -b && vite build
npm run lint      # oxlint
```

## What this is, and what it is not

This is a **third frontend** in the repo, alongside the Expo app at the root and the React SPA in
`web/`. It shares **no code** with either — `src/types/market-listing.ts` and `src/services/` are
hand-kept copies, so a change to the server's `MarketListingDto` has to be made here as well.

`web/` already has a fuller marketplace at `/market`: buy/rent/mine tabs, search, category filters,
listing detail pages, and the upload, edit, delete and mark-sold flows. **This app only reads.**
It exists to show one thing well.

## How it works

- `GET /api/marketlistings?mine=true` is the whole data layer — that `mine` flag is what makes the
  grid the user's own uploads rather than the open market.
- That endpoint needs a bearer token, so there is a small sign-in against `POST /api/auth/login`,
  the same endpoint the SPA uses. The session is stored under `marketplace.auth.session`.
- On its own port this app has its own `localStorage`, so it cannot see a session created in the
  SPA. `session.ts` also reads the SPA's `farm.auth.session` key as a fallback, so that if the two
  are ever served from the same origin, signing in once is enough.

## Configuration

`VITE_API_URL` is baked into the bundle at build time. Copy `.env.example` to `.env` and set it;
without one, builds fall back to `http://localhost:5261`.

## Notes

- The grid is three columns, stepping to two below 900px and one below 560px — three columns on a
  phone would make every card unreadable at once.
- A listing uploaded without a photo shows its initial. The SPA falls back to the crop's or
  animal's own artwork there; that artwork lives in `web/src/assets/`, and copying a few hundred
  PNGs to say the same thing was not worth it.
