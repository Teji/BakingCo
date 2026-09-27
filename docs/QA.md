# Verification — 27 September 2026

- `npm run build`: admin SDK/application bundle generated successfully, served from this application without a runtime CDN.
- `npm test`: 41 tests passed. Includes every public route/admin shell, missing-page status, asset/font availability, filtered catalogue, product bag/quantity/removal interactions, admin cake-price save and website-settings save against fixtures, custom form success/failure, server-side price recalculation, expiry, invalid inputs, unavailable products, quote-only prices, minimum-date behavior and idempotent retry references.
- Live read-only Supabase check returned the three existing public cakes (Barbie, Gold, women). Product names, descriptions, images and saved prices were retained. The live database was not seeded, migrated or mutated during testing.
- Production dependency audit: zero reported vulnerabilities at check time.
- Order database-failure test returns no WhatsApp action; successful save response reveals the action. Anonymous order insert does not chain SELECT, preserving v11 order privacy behavior.
- Local browser preview was blocked by the browser environment (`ERR_BLOCKED_BY_CLIENT`). No desktop/mobile rendered visual inspection or pixel-perfect screenshot comparison is claimed. Responsive CSS covers desktop, tablet and mobile; rendered-browser acceptance remains to be checked on the deployed URL.
- No authenticated live admin account/password was used, no real customer enquiry was inserted, no WhatsApp message was sent, and no live deployment was performed. Admin and order write tests used mocks. The new settings SQL must be run once in the owner's existing Supabase project.
- Existing database policies and Storage/admin credentials are prerequisites, retained from the v11 app. The newly included migration only adds the admin-protected public website-settings table.
- Public contact/policy defaults and existing product prices need owner review before publishing. In particular, legacy price/servings inputs were preserved, not guessed or changed.

Owner acceptance: deploy preview, run settings migration, sign in, update one intended product, upload a photo, save site settings, submit one test enquiry, inspect its reference under Orders, then mark the test enquiry cancelled. Check mobile crop/navigation before production deployment.
