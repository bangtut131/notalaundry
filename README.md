# Nota Laundry PRO - SaaS Management Platform

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Database**: PostgreSQL (via Prisma ORM)
- **Styling**: Tailwind CSS v4
- **Auth**: Cookie-based sessions

## Getting Started

```bash
npm install
npx prisma db push
npx ts-node prisma/seed.ts   # Create Super Admin
npm run dev
```

## Environment Variables

```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
SUPERADMIN_EMAIL=superadmin@notalaundry.id
SUPERADMIN_PASSWORD=admin123
SUPERADMIN_NAME=Super Admin
```

## Deployment (Railway)

1. Push to GitHub
2. Connect repo in Railway
3. Add PostgreSQL plugin
4. Set `DATABASE_URL` from Railway PostgreSQL
5. Set build command: `npx prisma generate && npx prisma db push && npm run build`
6. Set start command: `npm start`
7. Run seed: `npx ts-node prisma/seed.ts`
