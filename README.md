# marketplace

A standalone React + Vite app: the farm marketplace, three listings to a row. Public to browse and
to buy from, with its own registration and sign-in for the sellers who list on it.

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

`web/` also has a marketplace at `/market`, for a farmer who sells what their farm produces. **This
app is the marketplace's own front door**: it is where a shop that only sells here signs up, and it
is readable by anyone who has never signed in.

## How it works

- **The market is public.** `GET /api/marketlistings` and the checkout endpoints are
  `[AllowAnonymous]`, so browsing, opening a listing and ordering all work with no account. That is
  deliberate — a shop window nobody has to sign in to look at.
- **Signing in is for the seller side.** `/register` posts to `POST /api/auth/register-seller`,
  which creates the account in the same `Users` table the farm software signs into, marked
  `IsSeller` and **without** `HasManagementAccess` — so a shop is never handed a farm to manage,
  and no tenant database is provisioned for it. `/login` posts to the same `POST /api/auth/login`
  the SPA uses.
- The session is stored under `marketplace.auth.session`. On its own port this app has its own
  `localStorage`, so a session made in the SPA is invisible here and vice versa — signing in
  happens once per app, deliberately.

## Configuration

`VITE_API_URL` is baked into the bundle at build time. Copy `.env.example` to `.env` and set it;
without one, builds fall back to `http://localhost:5261`.

## Notes

- The grid is three columns, stepping to two below 900px and one below 560px — three columns on a
  phone would make every card unreadable at once.
- A listing uploaded without a photo shows its initial. The SPA falls back to the crop's or
  animal's own artwork there; that artwork lives in `web/src/assets/`, and copying a few hundred
  PNGs to say the same thing was not worth it.
