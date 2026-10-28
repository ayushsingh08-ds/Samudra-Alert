# 🛡️ Samudra-Alert — Real-Time Hazard Platform

Production-grade, community-driven incident reporting and alerting for India. **One React codebase → web + native Android.** Offline-first, real-time, with image evidence, push alerts, and a full moderation workflow.

![stack](https://img.shields.io/badge/React_19-Vite_7-38BDF8) ![api](https://img.shields.io/badge/Express-Mongoose-0EA5E9) ![mobile](https://img.shields.io/badge/Capacitor-Android-14C38E)

## Architecture

```
┌────────────────────────────────────────────────────────────┐
│                    client/ (React 19 + Vite)                │
│   Web (Vercel/nginx)  ·  Android (Capacitor WebView)        │
│   Zustand · React Query · Socket.IO client · Leaflet        │
│   Offline: IndexedDB queue + auto-sync · FCM push           │
└──────────────────────┬─────────────────────────────────────┘
                       │ REST + WebSocket
┌──────────────────────▼─────────────────────────────────────┐
│                 server/ (Express + TS)                      │
│  Auth (JWT access/refresh, rotation+revocation)             │
│  Reports (geo 2dsphere, status workflow, audit trail)       │
│  Alerts (broadcast → Socket.IO rooms + FCM fan-out)         │
│  Uploads (R2 presigned PUT) · Devices (push tokens)         │
└───────┬──────────────────┬───────────────────┬──────────────┘
        │                  │                   │
   MongoDB 7        Cloudflare R2        Firebase FCM
   (reports,         (hazard photos)      (push delivery)
    users,
    alerts,
    devices)
        ▲
        │
┌───────┴────────────────────────────────────────────────────┐
│        shared/ (@samudra/shared — Zod + types)              │
│  One source of truth for validation + entity contracts      │
└─────────────────────────────────────────────────────────────┘
```

## Monorepo layout

| Path | What |
|---|---|
| `client/` | React 19, Vite 7, Tailwind 4, mobile-first shell; Capacitor Android in `client/android` |
| `server/` | Express API, Socket.IO, Jest tests, seed script |
| `shared/` | `@samudra/shared`: Zod schemas, all-India region boxes, API types |
| `docker-compose.yml` | mongo + server + web (nginx) |

## Quick start

```bash
npm ci                      # installs all workspaces from the root lockfile
npm run build -w shared     # shared contracts -> dist

# Terminal 1
cp server/.env.example server/.env   # fill secrets
npm run dev:server

# Terminal 2
cp client/.env.example client/.env
npm run dev:client          # http://localhost:5174

# Demo data (users + 24 national incident reports + alerts)
npm run seed
```

**Demo accounts** (after seeding, password `Password123!`):

| Email | Role |
|---|---|
| admin@samudra-alert.in | admin — sees Alert Composer |
| moderator@samudra-alert.in | moderator — Verification Queue |
| citizen@samudra-alert.in | citizen — report + feed |

## Feature modules

**Citizen** — live feed (socket-updated), hazard map w/ bottom-sheet details, 5-step report wizard (category → severity → GPS/map location → camera photos → review), offline queue w/ photo support, notification center.

**Moderator** — verification queue with real stats (today count, 7-day trend, avg verification time), verify/reject with reason, live updates as reports arrive.

**Admin** — alert composer: template picker, severity, tap-to-place target zone with radius slider, optional push fan-out, delivery stats. Broadcast hits every connected client instantly (Socket.IO) and registered devices (FCM).

**Platform** — JWT rotation + revocation, rate limiting, helmet, zod validation on every input, in-memory refresh denylist (swap for Redis at scale), audit history on every report.

## API overview

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` · `/login` · `/refresh` · `/logout` | – / cookie | Session lifecycle |
| GET | `/api/users/me` | ✅ | Current user |
| GET | `/api/reports` | – | Filter + paginate (status, category, severity, region) |
| GET | `/api/reports/nearby?lat&lng&radiusKm` | – | `$geoNear` radius search |
| GET | `/api/reports/:id` | – | Full report + timeline |
| POST | `/api/reports` | ✅ | Create (title, desc, category, severity, lat/lng, images[]) |
| PATCH | `/api/reports/:id/status` | mod/admin | Verify/reject/resolve — emits socket + high-sev push |
| GET | `/api/alerts` | – | Broadcast history |
| POST | `/api/alerts` | admin | Broadcast → sockets + FCM |
| POST/DELETE | `/api/devices[/:token]` | ✅ | Register/remove push token |
| POST | `/api/uploads/presign` · `/confirm` | ✅ | R2 direct upload flow |
| GET | `/api/admin/reports/pending` | mod/admin | Verification queue |
| GET | `/api/admin/stats` | mod/admin | Status counts, today, trend, avg verify time |

**Socket.IO events** (server → client): `report:created`, `report:updated`, `alert:broadcast`. Rooms: `global` + `region:<state>`.

## Mobile app (Android)

```bash
npm run mobile:sync      # build web + sync to native shell
npm run mobile:android   # open Android Studio
```

Native: GPS, camera, FCM push, haptics, splash. Full release/signing/Play Store guide in **[client/README-MOBILE.md](client/README-MOBILE.md)**.

## Deployment

| Piece | Where | Notes |
|---|---|---|
| API | Render / Railway / Fly | Set env from `server/.env.example`; `npm start` runs `node dist/index.js` |
| Web | Vercel / Netlify | Root `client/`, build `npm run build -w client`, output `client/dist` |
| Database | MongoDB Atlas free tier | |
| Images | Cloudflare R2 bucket + public r2.dev domain | |
| Push | Firebase console | Service-account JSON → base64 → server env |

`docker compose up --build` runs the whole stack locally (web on :8080, API on :5000).

## Testing

The API tests use MongoDB at `mongodb://localhost:27017/samudra-alert-test`. The Playwright end-to-end suite starts the API and Vite client locally and uses the separate `samudra-alert-e2e` database; MongoDB must be available on port 27017. In CI, MongoDB is provided as a service.

```bash
npm test
npx playwright install chromium  # one-time browser install
npm run test:e2e
```

## Scripts

| Command | Scope |
|---|---|
| `npm run dev` | server + client concurrently |
| `npm test` | server Jest suite |
| `npm run test:e2e` | Playwright browser end-to-end suite (starts local test services) |
| `npm run seed` | demo data |
| `npm run mobile:sync` / `mobile:android` | Android build pipeline |

## Roadmap

Redis-backed socket scaling + token store · email verification & password reset · AI-assisted report triage · i18n (Hindi/Tamil/Telugu) · iOS build · INCOIS/IMD official feed ingestion.

## License

MIT — see [LICENSE](LICENSE).
