# HeskemFlow — מערכת ניהול חוזים

Contract lifecycle management system built with Next.js, Prisma, and Clerk.

## Tech Stack

- **Framework:** Next.js 16 (App Router, Server Actions)
- **Database:** MySQL / MariaDB via Prisma ORM
- **Auth:** Clerk (Hebrew localization)
- **UI:** Tailwind CSS, shadcn/ui
- **Language:** TypeScript

## Prerequisites

- Node.js 20+
- MySQL 8+ or MariaDB 10.6+
- Clerk account (free tier works)

## Local Development

### 1. Install dependencies

```bash
cd heskemflow
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your values:

| Variable | Description |
|---|---|
| `DATABASE_URL` | MySQL connection string: `mysql://user:pass@host:port/dbname` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `NEXT_PUBLIC_APP_URL` | App URL (default: `http://localhost:3000`) |

### 3. Set up the database

```bash
# Create the database
mysql -u root -p -e "CREATE DATABASE heskemflow"

# Run migrations
npx prisma migrate deploy

# (Optional) Seed demo data
npx prisma db seed
```

### 4. Start dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deployment (Vercel)

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

### 2. Create Vercel project

- Import the repo in [Vercel](https://vercel.com/new)
- Set **Root Directory** to `heskemflow`
- Framework preset: **Next.js** (auto-detected)

### 3. Configure environment variables

Add these in Vercel project settings > Environment Variables:

| Variable | Value |
|---|---|
| `DATABASE_URL` | Your production MySQL connection string |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk production key |
| `CLERK_SECRET_KEY` | Clerk production secret |
| `NEXT_PUBLIC_APP_URL` | `https://your-domain.vercel.app` |

### 4. Database setup

Use a managed MySQL provider:
- [PlanetScale](https://planetscale.com)
- [Aiven](https://aiven.io)
- [Railway](https://railway.app)
- [AWS RDS](https://aws.amazon.com/rds/)

Run migrations against production:

```bash
DATABASE_URL="mysql://..." npx prisma migrate deploy
```

### 5. Deploy

Vercel auto-deploys on push to `main`. Manual deploy:

```bash
npx vercel --prod
```

## Project Structure

```
heskemflow/
├── prisma/
│   ├── schema.prisma       # Database schema
│   ├── migrations/          # Migration history
│   └── seed.ts              # Demo data seeder
├── src/
│   ├── app/
│   │   ├── (auth)/          # Sign-in / sign-up pages
│   │   ├── (dashboard)/     # Protected dashboard routes
│   │   └── client-portal/   # Public contract review portal
│   ├── actions/             # Server actions
│   ├── components/          # React components
│   └── lib/                 # Utilities (auth, prisma, etc.)
├── .env.example             # Environment template
└── prisma.config.ts         # Prisma config
```

## Key Features

- Contract creation with templates and clauses
- Contract versioning and audit trail
- Client portal for contract review and mock signature
- CRM data management (companies, contacts, deals)
- Role-based access control (ADMIN, MANAGER, LEGAL, SALES, VIEWER)
- Hebrew RTL interface
- Contract export (HTML / print-to-PDF)

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npx prisma migrate deploy` | Run migrations |
| `npx prisma db seed` | Seed demo data |
| `npx prisma studio` | Open database GUI |
