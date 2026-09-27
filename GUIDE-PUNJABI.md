# _baking_co Node website — poori step-by-step guide

Eh v12 Node.js app hai. Tuhade v11 wale **existing Supabase cakes, photos, admin accounts te orders** use kardi hai. Site de roz de changes admin ton honge; coding di lorh nahi.

## 1. Pehla site apne computer te chalao

1. ZIP nu **Extract All / Unzip** karo. Andar `baking-co-node` folder hovega.
2. Node.js di official website https://nodejs.org ton **Node 24 LTS** install karo.
3. Folder VS Code vich kholo. Menu **Terminal → New Terminal**.
4. Eh commands ik-ik karke chalao:

```bash
node --version
npm ci
npm run build
npm start
```

5. Browser vich **http://localhost:3000** kholo. Eh public website hai.
6. **http://localhost:3000/admin** kholo. Eh owner portal hai.
7. Apna **existing Supabase admin email/password** pao. Koi nava default password nahi banaya.
8. Server band karna hove: terminal vich **Ctrl + C**.

`index.html` double-click karke shop nahi challegi: Node server running hona zaroori hai. `START-HERE.html` sirf eh guide hai, shop nahi.

## 2. Homepage admin editor ik vaar enable karo

Tuhade cakes/orders already existing database vich ne. Sirf nava settings table add karna hai:

1. https://supabase.com/dashboard kholo.
2. Ohi project kholo jo tuhadi v11 site vartdi hai.
3. **SQL Editor → New query**.
4. ZIP di `supabase/06-website-settings.sql` file kholo.
5. Puri file copy/paste karke **Run** karo.
6. Website `/admin/settings` kholo. Headline ya banner edit karke **Save website settings** dabao.

Eh migration cakes, orders ya admins delete/reset nahi kardi. Purane 02–05 scripts reference lai rakhe ne; working v11 project te oh dubara chalaun di lorh nahi. Bilkul nave Supabase project lai pehla base `cakes`, `admins`, `orders` te Storage/RLS setup chahida; existing project use karna is upgrade da intended rasta hai.

## 3. Nawa cake add karna

1. `/admin` → **+ Add cake**.
2. **Cake name**: display hon wala naam.
3. **Unique cake ID / slug**: lowercase te hyphens, e.g. `rose-birthday-cake`. Existing cake da slug bina lorh na badlo; usda public URL is naal bnda hai.
4. **Category**: e.g. Birthday / Anniversary. Category save hovan te category lists automatically update hundiyan ne.
5. **Description**: cake di public detail.
6. **Upload main photo**: apni JPG, PNG ja WebP select karo. Upload ton baad URL aap bhar javega. Photo 5 MB ton chhoti hove.
7. Gallery photos optional ne: **Upload gallery photos**.
8. **Flavours / Egg choices**: comma-separated options. E.g. `Vanilla, Chocolate`.
9. Ingredients te allergy information pao. Eh detail cake page te dikhdi hai.
10. **Weights, packs & prices**: size name, normal price, optional offer price te servings pao. **+ Add weight / pack** naal hor size.
11. Price blank rakhan te **Quote on request** dikhuga. ₹0 na pao.
12. **Visible on website** tick karo. **Available to enquire** tick karo. New cake default hidden hunda hai.
13. **Featured** tick karan te homepage collection vich priority milegi. **Display priority** vadh number da matlab pehla.
14. **Minimum notice days** pao: e.g. 2 = customer 2 din pehla enquiry date select kare.
15. **Sample/demo product** sirf sample layi tick karo; apne actual cake layi untick.
16. **Save changes**. Public site refresh karke check karo.

Cake di photo/price change karan lai **Cakes → cake card → edit → Save changes**. Live admin changes lai Git push/redeploy nahi chahida.

## 4. Cake temporarily hide ja permanently remove karna

- Temporary hide: cake kholo → **Visible on website** untick → Save.
- Not available: **Available to enquire** untick → Save. Existing v11 public policy unavailable cakes nu public catalogue ton hide kardi hai.
- Permanent delete: cake kholo → **Delete** → confirmation. Eh database ton cake remove karda hai. Purane orders vich cake di saved detail rehndi hai.
- Backup: admin top bar **Export cakes JSON**. Sare cakes, prices, descriptions, image URLs te offers ik file vich download honge. Eh backup/export hai; file nu apne computer te edit karan naal live site automatic update nahi hundi. Live source Supabase `cakes` table hai, jisnu admin edit karda hai.

## 5. Offer lagana / badalna / hatauna

1. Cake open karo.
2. Size wale **Regular ₹** vich normal price pao.
3. **Offer ₹** vich chhoti sale price pao. E.g. regular 1000, offer 850.
4. **Offer label** vich `15% off` ja `Weekend special` varga readable text pao. Label sirf text hai; calculation `Offer ₹` ton hundi hai.
5. **Offer expiry** select karo. Offer expiry wale din India time de end tak active hunda hai; agle din normal price aap lagda hai.
6. Save changes.
7. Offer remove: har affected variant da **Offer ₹** blank, offer label blank, expiry blank → Save.

Puri site da top message change karna: **Website settings → Top announcement / store-wide offer**. Eh announcement hai, automatic cart coupon nahi.

## 6. Photos badlan da sab ton saukha rasta

| Photo / content | Kithe change hunda |
|---|---|
| Cake main photo | Admin → Cakes → cake → Upload main photo → Save |
| Cake gallery | Same cake → Upload gallery photos / gallery URLs → Save |
| Homepage main banner | Admin → Website settings → Hero banner → Upload replacement → Save website settings |
| Custom-cake promo photo | Website settings → Custom-cake promotion → Upload → Save |
| Round categories | Us category de first cake di main photo ton automatic |
| Occasion/style sections | Existing cake photos ton automatic; dedicated custom request link relevant form kholda |
| Cake diary when no reels | First 3 actual cake photos, Instagram link naal |
| Real reel cards | Website settings → Add reel link → title, reel URL, cover photo URL → Save |

Banner lai 1800×750 ya wider photo changi rahegi; mobile crop vi check karo. Cake photos square, lagbhag 1200×1200, JPG/WebP te 5 MB ton thalle rakho. Main hero default **illustrative sample** hai; actual bakery banner upload karke **sample banner** checkbox untick kar deo. Product cards already tuhadi live catalogue di photos vartde ne.

Code/file naal photo badalni hove: file `public/assets/images/` vich rakho, admin photo field vich `/assets/images/my-cake.jpg` pao. File add karan lai Git push/deploy chahida. Admin upload wala rasta redeploy bina kam karda hai.

## 7. Order pehla save, fer WhatsApp — exact working

1. Customer cake page te weight, flavour, egg option, quantity te cake message choose karda hai.
2. **Add to my bag** → `/cart`.
3. Naam, phone, date, Delivery/Pickup te address bharda hai.
4. **Save enquiry & continue** dabaunda hai.
5. Node server current database ton price, availability, options te notice period check karda hai. Customer bheji price trust nahi hundi.
6. Order `orders` table vich **new** status naal insert hunda hai; `BC-…` reference milda hai.
7. Sirf successful save ton baad **Continue on WhatsApp** button dikhda hai.
8. Customer button dabaunda hai; reference te order detail WhatsApp message vich khuldi hai. Customer WhatsApp vich **Send** dabaunda hai.
9. WhatsApp na khulle ja customer message na bheje, enquiry fer vi admin vich saved hai.
10. Database save fail hove: error message aunda hai; WhatsApp link nahi milda. Retry karan te same enquiry di duplicate entry nahi bndi.

Custom/corporate enquiry vi ehi save-first flow vartdi hai. Enquiry saved hon da matlab payment/order confirmed nahi. Final design, delivery cost, payment te price tusi customer naal agree karne ne.

## 8. Admin vich orders handle karne

`/admin/orders` kholo. Customer, phone, date, delivery/pickup, address, cakes, subtotal, notes te message dekhoge.

- **new**: navi enquiry.
- **contacted**: customer naal gal ho gayi.
- **confirmed**: details/payment arrangements tuhade process mutabik agree ho gaye.
- **completed**: cake deliver/collect ho gaya.
- **cancelled**: enquiry cancel ho gayi.

Status dropdown ja **Confirm / Cancel** button use karo. **Refresh** naal newest enquiries load karo. Status change apne aap customer nu WhatsApp message nahi bhejda.

## 9. Har public page kithon change hunda

| URL | Working | Template / file |
|---|---|---|
| `/` | Banner, categories, collection, occasions, custom links, budget, social | `views/home.ejs` |
| `/cakes` | Search/category/flavour/weight/budget/offer filters, sort | `views/cakes.ejs`; filters in `server.js` |
| `/cakes/cake-slug` | Photos, variants, prices, flavour, add to bag | `views/product.ejs`, `public/js/store.js` |
| `/cart` | Edit quantity, remove item, customer details, saved enquiry | `views/cart.ejs`, `public/js/store.js` |
| `/custom` | Custom design enquiry | `views/custom.ejs` |
| `/corporate` | Corporate enquiry using same saved-order flow | `views/custom.ejs` |
| `/about` | Bakery introduction | Admin Website settings → About; `views/info.ejs` |
| `/contact` | Phone, social links, areas, custom enquiry | `views/contact.ejs`, Website settings |
| `/faq` | Customer questions | `views/faq.ejs` |
| `/policies/delivery` | Delivery info | Website settings → Delivery page |
| `/policies/refund` | Cancellation/refund info | Website settings → Cancellation page |
| `/policies/privacy` | Customer data info | Website settings → Privacy page |
| `/policies/terms` | Ordering terms | Website settings → Ordering terms |
| `/admin` | Owner login + dashboard | `views/admin.ejs` |
| `/admin/cakes` | Cake CRUD/photo/variants | `public/js/editor-live.js` |
| `/admin/offers` | Offer overview; open cake to edit | `public/js/editor-live.js` |
| `/admin/categories` | Categories from cake records | `public/js/editor-live.js` |
| `/admin/orders` | Saved orders and status changes | `public/js/editor-live.js` |
| `/admin/settings` | Homepage, contact, policies, reels, reviews | `public/js/settings.js` |

Shared header/menu: `views/partials/head.ejs`. Footer: `views/partials/footer.ejs`. Cake cards: `views/partials/card.ejs`. Shared customer form: `views/partials/enquiry-fields.ejs`.

Design colours, spacing, mobile rules: **`public/css/store.css`**. Admin styling: **`public/css/admin.css`**. Node page/API routing: **`server.js`**. Database read mapping: **`server/catalog.js`**. Order validation/save logic: **`server/orders.js`**.

Live product data ik central table `cakes` vich hai; live homepage data ik `site_settings` row vich. `data/site.json` sirf default values hai, jadon admin settings save nahi hoye. Admin settings save ho jaan baad database values defaults ton priority lainde ne. `data/catalog-snapshot.json` offline preview snapshot hai, live catalogue nahi.

## 10. GitHub te upload commands

Pehla GitHub te login karke **New repository** bnao, e.g. `baking-co-node`. Empty repo bnao; README/license nu GitHub ton add na karo, files already folder vich ne.

Terminal project folder vich:

```bash
git init
git add .
git commit -m "Build Baking Co Node storefront and admin"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/baking-co-node.git
git push -u origin main
```

`YOUR_USERNAME` nu apne GitHub username naal replace karo. GitHub login prompt aave taan apne account naal sign in karo. Je existing repository update kar rahe ho, existing repo folder vich files copy karo (purani .git preserve), `git init` / `remote add` di lorh nahi:

```bash
git status
git add .
git commit -m "Redesign Baking Co as a Node app"
git push
```

`.env`, `node_modules` te `.vercel` Git vich ignore ne. Public publishable key repository vich hona expected hai; admin password/service-role secret kade public code vich na pao.

## 11. Vercel te publish

GitHub code store karda hai. **Vercel Node server chala ke site live karda hai. GitHub Pages is Node app nu nahi chala sakda.**

1. https://vercel.com te apne GitHub account naal login karo.
2. **Add New → Project → Import Git Repository**.
3. `baking-co-node` select karo.
4. Root Directory ohi folder hove jithe `package.json` te `server.js` ne.
5. Node version **24.x** rakho.
6. Build Command: **`npm run build`**.
7. Output Directory nu manually `dist`/`public` na set karo; default/unset rakho. Eh Express application hai.
8. Existing public Supabase config already included hai. Hor project use karna hove taan Environment Variables vich **SUPABASE_URL** te **SUPABASE_PUBLISHABLE_KEY** dono set karo. Same v11 project lai zaroori nahi.
9. `DEMO_MODE` absent ja `false` hove; `true` production vich na rakho.
10. **Deploy** dabao. Live URL kholo, `/admin` check karo.
11. Supabase → Authentication → URL Configuration vich **Site URL** apna real live URL karo. Redirect URLs vich `https://YOUR-DOMAIN/admin` te local testing lai `http://localhost:3000/admin` add karo. Eh forgot-password recovery lai hai.
12. Supabase settings SQL step 2 poora kita hove. Admin settings save karke live page refresh karo.

CLI pasand hove taan project folder ton:

```bash
npx vercel login
npx vercel
```

Pehla command sign-in karega, duja preview deployment. Preview inspect karan baad:

```bash
npx vercel --prod
```

Vercel naal Git repo connect hove taan agle `git push` naal automatic deployment hovegi. Product/photo/offer changes admin ton karan te Git push di lorh nahi.

## 12. Publish ton baad practical check

1. Phone te homepage, menu, search, cake page te photo cropping kholo.
2. Admin ton ik intended real cake detail update karke storefront refresh karo.
3. Apne test naam naal ik enquiry submit karo. Success reference note karo.
4. WhatsApp link khol ke message check karo; test message bhejna zaroori nahi.
5. Admin Orders vich same reference check karo, test enquiry cancelled mark kar deo.
6. Real prices, servings, notice days, contact number te delivery terms confirm karo. Existing saved values preserve kite ne; imported prices nu asi assume/correct nahi kita.

## 13. Password / login troubleshooting

- Existing admin email/password hi use hovega. Website da public contact number login password nahi.
- Login page te email bharo → **Forgot password?**. Email da link same live domain `/admin` te auna chahida.
- `localhost` wala recovery link aave taan Supabase URL Configuration step 11 correct karo te nava reset email mangao.
- `This account is not listed in public.admins` da matlab auth account hai par owner membership nahi. Supabase Authentication → Users vich user UUID verify karke SQL Editor vich apne trusted user lai:

```sql
insert into public.admins (user_id)
values ('PASTE_VERIFIED_USER_UUID')
on conflict (user_id) do nothing;
```

- Nawa user create/password set Supabase dashboard vich karo. Apna password public code vich nahi pauna.
- `site_settings` error: migration06 run karo.
- Photo upload permission error: existing `cake-images` bucket te admin Storage policy verify karo; bucket da public image read hona te authenticated admin upload hona chahida.
- Catalogue unavailable: Supabase project online hai, public key/url theek ne te `cakes` read policy enabled hai, check karo. App live failure te purane sample prices nal ordering enable nahi kardi.
- `npm` not recognized: Node install karke terminal dubara kholo.
- Port in use: purana server Ctrl+C; ja `.env` vich `PORT=3001`, fer http://localhost:3001.

## 14. Reference naal ki match karda, ki bakery de mutabik hai

Cream/brown/coral palette, logo/search header, brown menu, round category row, wide curtain-style hero, square product cards, occasions, style/type panels, custom promotion, social cards, age/weight links, budget cards, information sections te dark footer reference wale pattern vich rebuilt ne.

Brand, contact, social links te live cakes Baking Co de ne. Reference de testimonials/press badges invent nahi kite. Genuine reviews admin ton add karan te section dikhda hai. Customer account icon di jagah help/contact hai; customer sign-up/payment gateway is enquiry-based version vich add nahi kita. Reels direct original social link te khuldiyan ne; unverified copied videos nahi ship kite.

Eh independently rebuilt design hai, competitor da Shopify source/theme export nahi. Automated logic/page tests pass hoye ne, par browser ne local preview block kita, is karke exact pixel match/mobile visual screenshot validation claim nahi kita. Deployment ton baad upar wale practical checks karo.
