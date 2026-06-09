# Deployment guide

## Prerequisites

- Node.js 20+
- A PostgreSQL instance (any provider)
- An `APP_URL` for your deployed domain

## 1. Environment variables

Copy `.env.example` to `.env` (or configure your hosting provider's env vars):

```
DATABASE_URL="postgresql://user:password@host:5432/agentic_inbox?schema=public"
AUTH_SECRET="<output of: openssl rand -base64 32>"
SEED_ADMIN_PASSWORD="<your initial admin password>"
AIMEKO_TOKEN="aim_..."
APP_URL="https://your-domain.com"
```

## 2. Database setup

Run migrations and seed the admin user:

```bash
npm run db:migrate
npm run db:seed
```

The seed creates `peter@restorative.dev` as admin using `SEED_ADMIN_PASSWORD`.

## 3. Build and start

```bash
npm run build
npm start
```

Or deploy to Vercel / any Node hosting. Make sure all env vars above are set on the platform.

## 4. MacOS desktop app (Pake)

Install Pake CLI:

```bash
npm install -g pake-cli
```

Build the desktop app pointing at the deployed URL:

```bash
pake https://your-domain.com --name "Agentic Inbox" --identifier com.aimeko.agentic-inbox
```

Or use the bundled `pake.json` after updating the `url` field to your deployed URL:

```bash
pake --config pake.json
```

The `.app` bundle is output in the current directory. Distribute or install by dragging to `/Applications`.
