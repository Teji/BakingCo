# Image paths and replacement

Use Admin → Cakes → Upload main photo / gallery for products; Admin → Website settings for the hero/promo. Uploads go to the existing `cake-images` Supabase bucket, and the returned HTTPS URL is stored with the product/settings. Click Save after upload. Existing photos are not automatically deleted when replaced, so another product is not accidentally broken.

| Bundled path | Meaning |
|---|---|
| `/assets/images/baking-co-1.png` | Owner's current Barbie cake photo, offline snapshot/promo |
| `/assets/images/baking-co-2.png` | Owner's current Gold cake photo, offline snapshot |
| `/assets/images/baking-co-3.png` | Owner's current women cake photo, offline snapshot |
| `/assets/images/hero-sample.png` | Illustrative AI-generated hero; replace in settings |
| `/assets/images/placeholder.svg` | Admin new-cake placeholder; a real uploaded image is required before Save |
| `chocolate.jpg`, `pink.jpg`, `wedding.jpg`, `cupcakes.jpg` | Legacy stock images kept for existing path compatibility |

Stock attribution inherited from prior site: kaouther djouada (Unsplash hcEDfkiVmMI), Deva Williamson (ntfGWVbBiO0, S2jw81lfrG0), Jason Leung (fXAuCMEYGY4). These are not the bakery's work and are not used as the live catalogue's real product photos.

Square product photos work best around 1200×1200 pixels. JPG/PNG/WebP uploads up to 5 MB are accepted. Hero banners should be wide, with room for the headline on the left; inspect the mobile crop after changing. Current site cards crop to square; change `.cake-photo img { object-fit: contain; }` in `public/css/store.css` if you want the entire original frame visible.

Never use Instagram page/reel URLs in an image field. Image fields need a direct image URL or uploaded file. Reel links have their own editor under Website settings.
