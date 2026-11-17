# Throttle (sell-bike)

A motorcycle marketplace. Sellers list bikes, buyers add them to a cart, and the sale completes when the seller approves. It is one project that deploys to Vercel: the React app is the website, and `api/` + `server/` run as Vercel functions on the same address.

```
src/        React (Vite) PWA
api/        Vercel entry: every /api/* request runs the Express app
server/     Express 5 API (routes, Postgres queries)
db/         schema.sql (new database) and existing-database.sql (yours)
public/     icons and static files
vercel.json single-page-app fallback
```

## Sale flow

| Step | Action | `status` | `buyer_id` | `bought_at` |
|---|---|---|---|---|
| 1 | Seller lists a bike | `Active` | null | null |
| 2 | Buyer adds it to cart | `Pending` | buyer | null |
| 3 | Seller approves | `Sold` | buyer | `NOW()` |
| – | Seller declines / buyer removes | `Active` | null | null |

Each step is one guarded `UPDATE ... WHERE status = ...`, so two buyers can't claim the same bike. There is no login: the browser makes a UUID once (`services/userService.js`) and sends it as `X-User-Id`; the API uses it as `user_id` / `buyer_id`.

## Database (Supabase)

1. In the SQL Editor, run Step 1, then Step 2, then Step 3 of `db/existing-database.sql`. Step 2 is safe to re-run.
2. Dashboard > Connect > copy the **Transaction pooler** string (port 6543). Vercel functions open many short connections, and that pooler is built for it.

## Run locally

```bash
npm install
cp .env.example .env     # paste DATABASE_URL
npm run server           # API on :4000
npm run dev              # web app on :5173 (proxies /api to the API)
```

The service worker is off in `npm run dev`. To test the PWA and offline mode locally: `npm run build && npm run preview`.

## Deploy to Vercel

1. Push the project to GitHub and import it in Vercel. The Vite preset is detected (build `npm run build`, output `dist`).
2. Add one environment variable: `DATABASE_URL` (the Transaction pooler string). Leave `VITE_API_URL` unset, because the API is on the same address.
3. Deploy. Then set Settings > Functions > Region to the one closest to your Supabase project, which makes every request faster.
4. Open `https://your-app.vercel.app/api/health`. It should answer `{"ok":true}`.

## PWA and offline

- **Install:** Android and desktop Chrome/Edge show an "Install app" button in the footer. On iPhone, Safari > Share > Add to Home Screen (iOS has no install button for web apps). The icon opens the app full screen. On Android, long-pressing the icon lists shortcuts: Showroom, Sell a bike, Transactions.
- **Offline:** the app itself (pages, scripts, styles, fonts, icons) is saved on the first visit. Bike lists, transactions and photos you have already viewed are kept too: they load from the network when online and from the saved copy when offline. A banner explains when you're offline. Listing, carting, approving and editing need a connection.
- **Updates:** a new deploy installs itself in the background and applies on the next open.
- Fonts are bundled (`@fontsource`), so they also work offline.

## API (under `/api`, header `X-User-Id: <uuid>`)

| Method | Path | Who |
|---|---|---|
| GET | `/health` | anyone |
| GET | `/images/bikes/:id` | anyone, the uploaded photo |
| GET | `/bikes` | Active bikes (`is_mine` flags your own) |
| GET | `/bikes/mine` | your listings, any status |
| GET | `/bikes/:id` | one listing |
| POST | `/bikes` | list a bike |
| PATCH | `/bikes/:id` | seller, only while Active |
| DELETE | `/bikes/:id` | seller, only while Active |
| GET | `/transactions/cart` · `/requests` · `/history` | buyer · seller · either |
| POST | `/transactions/:id/cart` · `/cancel` | buyer |
| POST | `/transactions/:id/approve` · `/reject` | seller |

## Bike data

- **Displacement** is stored as digits (`250`) and shown as `250cc`.
- **Specs** is one JSON object: `{"model_year": "2019", "cylinder": "2", "condition": "Good"}`. Condition is `Good`, `Some fixes needed` or `Parts only`.
- **Photos** are shrunk in the browser (max 1280px, JPEG) and stored in `bikes.image_data`. Older rows keep their `image_url`: full links work as they are, and site paths like `/images/yamaha.jpg` load from `public/images/`.
- **Profile** (avatar, username, description) is stored in `localStorage`.

## Notes

- Identity is an anonymous UUID in `localStorage`. Clearing site data creates a new identity, so that browser loses access to its old listings and cart. Anyone who knows a UUID can act as it, which is fine for a no-login app but not for anything holding real money.
- Prices display as Rupiah; change `formatPrice` in `src/utils/format.js` for another currency.
- Vercel limits a request body to about 4.5 MB. Photos are shrunk to a few hundred KB first, so this isn't reached.

## If an older photo doesn't show

1. Run `SELECT id, name, image_url FROM public.bikes WHERE image_url IS NOT NULL;` in Supabase and look at the value.
2. A full link (`https://...`) that is dead or blocks other sites can't be fixed here. The app now shows a grey placeholder instead of a broken icon. Edit the bike and upload the photo.
3. A site path like `/images/yamaha.jpg` needs the file at `public/images/yamaha.jpg`, then redeploy. A missing file now returns a 404 instead of the app's home page.
4. After redeploying, your phone or browser may keep the old broken result. Clear the site's data once (or remove and reinstall the app).
