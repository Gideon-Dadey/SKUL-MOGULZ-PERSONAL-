# Backend connection notes

The web and mobile clients talk to the Express API under `/api`.

## Local wiring

1. Start MongoDB (local or Atlas)
2. Fill `server/.env`
3. Run `npm run dev` from the repo root
4. Web Vite proxies `/api` and `/uploads` to `http://localhost:5000`

## What is live

- Auth register / login / profile
- Feed via `GET /api/posts`
- Create post via `POST /api/posts` (supports media)
- Network suggestions and invitations
- Messages and socket rooms
- Projects endpoints for discovery views

## Common gotchas

- Mobile devices cannot use `localhost` for the API. Use your machine LAN IP in `mobile/services/api.ts`
- Uploaded media URLs are relative (`/uploads/...`) and need the API host when rendered
- Do not commit real `.env` values

If a screen still looks empty, check the network tab first. Most “missing data” issues are a wrong endpoint or a dead database connection.
