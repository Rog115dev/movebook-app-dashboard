# App Settings Dashboard

Admin CMS for the **Movesbook FitAI Coach** mobile app. Edit titles, colors, plans, paywall offers, TRAIN PRO content, and images without shipping a new app build.

## Quick start

```bash
cd app-setting-dashboard
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3001](http://localhost:3001)

Default login:

- Username: `admin`
- Password: `admin123`

Change these in `.env.local`.

## What you can manage

| Section | Controls |
| --- | --- |
| Colors | Brand orange, backgrounds, borders |
| Home content | Titles, CTAs, confidence text, Why Choose Me |
| Plans | Free / Basic / Premium / Pro |
| Paywall | Duration tiers, discounts, trial copy |
| TRAIN PRO | Stats, features, FAQ |
| Images | Hero, paywall athletes, TRAIN PRO banner |

## Mobile app API

Public read endpoint (no auth):

```
GET http://localhost:3001/api/mobile-config
```

Returns the full JSON config the mobile app can fetch at runtime.

Settings are stored in `data/mobile-settings.json`. Uploaded images go to `public/uploads/`.
