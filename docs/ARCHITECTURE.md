# Architecture

SKUL MOGULZ is a straightforward three-part setup:

1. `client` — React web app (Vite)
2. `server` — Express API + Socket.io
3. `mobile` — Expo / React Native app

They talk over HTTP for most things, and websockets for chat and presence.

## How the pieces fit

```
Web / Mobile
    |
    |  REST + JWT
    v
Express API
    |
    |  Mongoose
    v
MongoDB

Socket.io sits beside the HTTP server for messaging and live events.
```

## Web app

`client/src` is organized by job, not by framework fashion:

- `pages/` — screens
- `components/` — shared UI
- `context/` — auth, theme, socket, calls
- `services/` — axios wrappers
- `styles/` — global CSS variables and layout

Routing lives in `App.tsx`. Auth state is kept in `AuthContext` and mirrored in `localStorage` so refresh does not boot people out.

## API

`server/src` follows a familiar Express shape:

- `routes/` — path definitions
- `controllers/` — request handlers
- `models/` — Mongoose schemas
- `middleware/` — auth and uploads
- `socket.ts` — realtime wiring

Uploads land in `server/uploads` and are served statically at `/uploads`.

## Mobile

The Expo app mirrors the web product closely: same auth flows, feed, network, and messaging. API base URL is configured in `mobile/services/api.ts`. On a physical phone, that should be your computer's LAN address, not `localhost`.

## Data that matters most

- **Users** — profiles, roles, connections, bookmarks
- **Posts** — feed updates and media
- **Projects** — longer-lived startup records
- **Messages / notifications** — conversation and alert state

## Design choices worth knowing

- JWT auth keeps the first version simple
- Posts and projects are separate collections so the feed can stay light
- Socket rooms are keyed by user id for direct messaging
- The web Vite server proxies `/api` and `/uploads` to port 5000 in development
