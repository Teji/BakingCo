# _baking_co · Node storefront v12

Start with **START-HERE.html** (double-click) or **GUIDE-PUNJABI.md**.

A Node.js + Express + EJS storefront built around the supplied Creme Castle layout reference, with the existing Baking Co v11 Supabase catalogue, admin accounts, image bucket and orders retained.

```bash
npm ci
npm run build
npm start
```

Open http://localhost:3000 and http://localhost:3000/admin.

Use Node.js 24 LTS. This is a server application; opening an HTML file directly, GitHub Pages, and static-only hosting will not run the shop.

## Existing connection

The existing public Supabase URL and publishable key remain in `public/js/supabase-config.js`. No admin password or service-role secret is shipped. Optional environment overrides are documented in `.env.example`. The app reads current public cakes from the database; `data/catalog-snapshot.json` is only an offline snapshot, never a silent fallback for live orders.

Run `supabase/06-website-settings.sql` once in the existing project's SQL Editor to enable live homepage/settings editing. Do not rerun older migrations if the v11 catalogue already works. No seed/import action is needed and the app never overwrites cakes on startup.

## Architecture

- `server.js`: Node routes, page rendering, public APIs and middleware.
- `server/catalog.js`: live public catalogue and website settings reads.
- `server/orders.js`: server-side enquiry validation, current price calculation, database insert and WhatsApp handoff.
- `views/`: one EJS template per page; shared header/footer under `views/partials/`.
- `public/css/store.css`: responsive storefront design.
- `public/js/store.js`: product selection, local bag and checkout form interactions.
- `public/js/editor-live.js`: existing authenticated cake/order admin, adapted to Node routes.
- `public/js/settings.js`: live site content editor and password recovery.
- `public/js/supabase-data.js`: Supabase browser client; admin CRUD is protected by the existing database RLS and admin membership.
- `browser-admin.js` / `scripts/build.mjs`: bundle the SDK and admin code locally, with no runtime CDN dependency.
- `supabase/`: existing migrations plus additive settings migration.

Customer data is stored in `orders` before a WhatsApp link is returned. No browser-submitted prices are trusted by the Node endpoint. Order references make retries of the same payload idempotent; duplicate attempts provide a reference-only follow-up message. Enquiries remain `new` until the admin changes the status; no payment or confirmed purchase is implied.

Admin mutations use the user's Supabase session and existing RLS, not a hardcoded password. Public settings contain public content only. Public order SELECT is not granted. The current v11 anonymous INSERT policy is retained for compatibility; the new Node endpoint validates its submissions, but this release does not replace that existing database policy with an API-only service-key system. Do not treat anonymous enquiry values as payment proof. Rate limiting is in-process; use host-level protection if abuse becomes an issue.

## Deploy

Vercel detects the exported Express app in `server.js`. Assets live in `public/`; `vercel.json` includes EJS templates and data in the server function. Import the GitHub repository, use Node 24.x and Build Command `npm run build`, and leave Output Directory unset. Full commands are in the Punjabi guide.

## Checks

```bash
npm run build
npm test
```

See `docs/QA.md` for the completed checks and unverified deployment/browser steps. Tests use fixtures and do not write to the live bakery database.

## Offline visual preview

Copy `.env.example` to `.env`, set `DEMO_MODE=true`, then start the app. This shows the dated three-cake snapshot with bundled cake images and disables enquiry submission. The admin portal still connects to the configured live Supabase account; do not make experimental edits there. Restore `DEMO_MODE=false` for live catalogue/orders.

## Sources / assets

- Layout reference supplied by owner: https://cremecastle.in/ and their screenshot.
- Product records and three cake images: the owner's existing Baking Co Supabase catalogue, read 27 September 2026. These are not competitor images.
- Hero banner: AI-generated illustrative cake scene, visibly labelled in the default site. Replace in Admin → Website settings → Hero photo.
- Font: Outfit, included under its OFL license (`public/assets/fonts/OFL.txt`).
- Older stock images remain under `public/assets/images/` for compatibility with existing photo paths; the new live product cards do not use them. See `docs/PHOTO-GUIDE.md`.

Official deployment reference: https://vercel.com/docs/frameworks/backend/express
Official auth/RLS reference: https://supabase.com/docs/guides/database/postgres/row-level-security
