# Elissya waitlist: setup

```
elissya/
  web/            Next.js 16 site (deploy this folder to Vercel)
  apps-script/    Code.gs, the Google Sheets backend
  logo.png, logo-dark.png   source logos (cleaned versions live in web/public/brand)
```

## Run locally

```bash
cd web
npm install
npm run dev          # http://localhost:3000, dashboard at /admin (password in .env.local)
```

Without Sheets configured, signups and events are saved to `web/.data/elissya.json` so you can test the whole funnel locally.

## 1. Google Sheet backend (about 5 minutes)

1. Create a new Google Sheet, e.g. "Elissya waitlist".
2. **Extensions > Apps Script**. Delete the starter code, paste in `apps-script/Code.gs`, and save.
3. **Project Settings (gear icon) > Script properties > Add script property**
   - Property: `SECRET`
   - Value: a long random string (run `openssl rand -hex 24` to make one)
4. **Deploy > New deployment > Select type: Web app**
   - Execute as: **Me**
   - Who has access: **Anyone** (the secret keeps it private; "Anyone with Google account" will break it)
   - Click Deploy, authorize, and copy the URL ending in `/exec`.
5. The `Events` and `Signups` tabs are created automatically on the first visit.

If you edit Code.gs later: **Deploy > Manage deployments > edit > Version: New version**. Otherwise the old code keeps running.

## 2. Deploy to Vercel

1. Import the repo on Vercel and set **Root Directory** to `web`.
2. Add these environment variables (Production, and Preview if you use it):

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Your exact public origin, no trailing slash, e.g. `https://elissya.ai`. Until you have a domain, use the `https://<project>.vercel.app` URL. |
| `SHEETS_WEBAPP_URL` | The `/exec` URL from step 1.4 |
| `SHEETS_SECRET` | The same value as the `SECRET` script property |
| `ADMIN_PASSWORD` | Password for `/admin` |
| `NEXT_PUBLIC_META_PIXEL_ID` | Optional. Pixel ID from Meta Events Manager (digits only) |

3. Redeploy after changing any `NEXT_PUBLIC_*` variable; those are baked in at build time.

**Important:** if `SHEETS_WEBAPP_URL` / `SHEETS_SECRET` are missing on Vercel, signups are not saved (Vercel's disk is read-only). The server logs an error saying so.

## 3. Once you have a domain

- Add it in Vercel > Settings > Domains.
- Update `NEXT_PUBLIC_SITE_URL` to it and redeploy (the OG image that WhatsApp/Instagram show uses it).
- In Meta Events Manager, verify the domain if you run conversion-optimized ads.

## 4. Meta ads tracking

Use this as the ad's website URL so the dashboard can split results by campaign and ad:

```
https://YOUR-DOMAIN/?utm_source=facebook&utm_medium=paid&utm_campaign={{campaign.name}}&utm_content={{ad.name}}
```

Visits with an `fbclid` and no UTM are counted as `facebook` automatically.

Pixel events fired: `PageView`, `WaitlistIntent` (custom, on any "I want it" click), `Lead` (email given), `CompleteRegistration` (finished the form).

## What gets tracked

Funnel steps (unique visitors), shown at `/admin` with 24h / 7d / 30d / all-time ranges:

1. Visited
2. Scrolled to demo
3. Clicked "I want it" (nav, hero or final CTA, recorded in `detail`)
4. Gave email (a row is created in `Signups` at this point, so partial signups are never lost)
5. Gave Instagram
6. Finished (answered or skipped the last step)

The dashboard also shows which step people closed the form at, a per-source breakdown, devices (including Instagram's in-app browser), the signup list, and a CSV export. The raw data is always in the Sheet too.
