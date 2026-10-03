# TaskFlow: full-stack task manager

React + TypeScript + Tailwind v3 frontend, Express + TypeScript + MongoDB backend, JWT in HTTP-only cookies, Cloudinary image uploads, Pusher real-time sync. Both halves deploy to Vercel as two projects.

```
taskflow/
├── client/   Vite + React app          -> Vercel project #2 (Root Directory: client)
└── server/   Express API (serverless)  -> Vercel project #1 (Root Directory: server)
```

## Run locally

You need Node 18+, a MongoDB Atlas database and a Cloudinary account (Pusher is optional).

```bash
# API (terminal 1)
cd server && cp .env.example .env     # fill in the values
npm install && npm run dev            # http://localhost:5000

# Web app (terminal 2)
cd client && cp .env.example .env
npm install && npm run dev            # http://localhost:5173
```

Vite proxies `/api` to `localhost:5000`, so the browser only ever talks to one origin and the auth cookie is first-party.
Run `npm run typecheck` in both folders before deploying.

## Environment variables

| Where | Name | Notes |
|---|---|---|
| server | `MONGODB_URI` | Atlas connection string including a database name |
| server | `JWT_SECRET`, `COOKIE_SECRET` | 16+ random chars each (`openssl rand -base64 48`) |
| server | `CLIENT_URL` | Exact frontend origin, e.g. `https://taskflow.vercel.app` (comma-separate several) |
| server | `COOKIE_SAMESITE` | Leave `lax` (the proxy setup below) |
| server | `CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET` | From the Cloudinary dashboard |
| server | `PUSHER_APP_ID/KEY/SECRET/CLUSTER` | Optional. Pusher Channels app |
| client | `VITE_PUSHER_KEY`, `VITE_PUSHER_CLUSTER` | Optional. Same key/cluster as above |
| client | `VITE_API_URL` | Leave empty (uses the `/api` proxy) |

## Deploy to Vercel (two projects)

1. **Atlas:** Network Access -> allow `0.0.0.0/0` (Vercel uses dynamic IPs).
2. **API:** New Vercel project from this repo, Root Directory `server`, Framework "Other". Add the server env vars. Set `CLIENT_URL` to your planned frontend URL (you can fix it and redeploy once the frontend exists). Deploy and note the URL, e.g. `https://taskflow-api.vercel.app`. Check `https://<api>/api/health`.
3. **Frontend:** open `client/vercel.json` and replace `YOUR-API-PROJECT.vercel.app` with the API domain. New Vercel project, Root Directory `client`, Framework "Vite". Add `VITE_PUSHER_*` if using real-time. Deploy.
4. Back in the API project make sure `CLIENT_URL` equals the frontend URL exactly, then redeploy.

**Why the rewrite?** The frontend's `vercel.json` proxies `/api/*` to the API project, so the browser sees one domain. That keeps the HTTP-only cookie first-party (works in Safari and with third-party-cookie blocking) and lets `SameSite=Lax` act as CSRF protection. The server also checks the `Origin` header on every state-changing request.

## Notes and trade-offs

- **Real-time on Vercel:** serverless functions cannot hold WebSockets, so live sync uses Pusher Channels (free tier is plenty). Without keys the app still works and refetches when the tab regains focus.
- **Uploads:** images stream through the API to Cloudinary (type-checked by MIME and Cloudinary's `allowed_formats`). Vercel caps request bodies at ~4.5 MB, so the browser downsizes photos to max 1600 px before upload and the API rejects files over 4 MB. Storage code is isolated in `server/src/services/upload.service.ts`.
- **Rate limiting** is in-memory per serverless instance. It blunts abuse but is not a global limit. Use Upstash/Redis if you need exact limits.
- **Smooth scrolling:** the landing page uses Lenis (the engine behind Locomotive Scroll v5). The dashboard uses native scrolling.
- **Drawings** are stored as stroke JSON on the task (not images), so undo/redo history survives and documents stay small.
- **Ownership:** tasks are only ever loaded by `{ _id, user }`; another user's task ID returns 404.

## API

```
POST /api/auth/register | login | logout        GET /api/auth/me
GET|PATCH /api/users/me      PATCH /api/users/me/password
POST|DELETE /api/users/me/avatar      POST /api/users/me/heartbeat
POST|GET /api/tasks          GET /api/tasks/categories
GET|PATCH|DELETE /api/tasks/:id
POST /api/tasks/:id/attachments     DELETE /api/tasks/:id/attachments/:attachmentId
GET /api/dashboard/stats     POST /api/realtime/auth
```
List filters: `q, status, priority, category, dueFrom, dueTo, overdue=1, noDue=1, sort=newest|oldest|due|priority`.

© 2026 Muhammad Taha. All rights reserved.
