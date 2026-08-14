# Microfinance Website — Foundation

Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + MySQL (Prisma) +
Nodemailer. This is the **structural foundation** — routing, layout, caching,
the loan application API, and design tokens are wired up. Real page content
(loan products, about, contact copy) is left as placeholders for you to fill in.

## Stack & why

| Piece | Choice | Why |
|---|---|---|
| Framework | Next.js 16, App Router | SSG/ISR for fast page loads, built-in `<Link>` prefetching so navigation feels instant, API routes for the backend call |
| Language | TypeScript | Shared types/validation between form and API |
| Styling | Tailwind CSS v4 | Utility-first, no separate config file (v4 uses `@theme` in CSS) |
| Database | MySQL via Prisma **v6** | Pinned to v6, not the just-released v7, which requires driver adapters, ESM-only output, and a custom generator path — unnecessary complexity for this use case |
| Email | Nodemailer via cPanel SMTP | Same pattern as your DMS Portal — not Gmail |
| Validation | Zod | One schema (`src/lib/validations/loanApplication.ts`) shared by the client form and the API route, so they can never drift apart |

## Project structure

```
src/
  app/
    layout.tsx          Root layout: fonts, Header/Footer, metadata
    page.tsx             Homepage (placeholder)
    loading.tsx           Route-level loading skeleton
    error.tsx              Route-level error boundary
    not-found.tsx            404 page
    apply/page.tsx             Loan application page
    loans/ about/ contact/     Placeholder pages — build these out next
    api/loan-application/route.ts   POST endpoint: validate → save → email
  components/
    layout/Header.tsx, Footer.tsx
    forms/LoanApplicationForm.tsx   Client form, wired to the API route
    ui/Pagination.tsx               Reusable pagination for future list pages
      (e.g. an admin view of submitted applications)
  lib/
    prisma.ts            Prisma client singleton (avoids connection leaks in dev)
    mailer.ts            Nodemailer transport + email template
    rateLimit.ts         In-memory rate limiter for the public form endpoint
    pagination.ts        parsePaginationParams / buildPaginatedResult helpers
    validations/loanApplication.ts   Zod schema (client + server)
  config/site.ts          Site name, nav links, contact info — one place to edit
  types/index.ts           Shared TS types
prisma/schema.prisma       MySQL schema (LoanApplication model)
```

## How the "fast loading / other pages just open" requirement is handled

1. **Static rendering by default.** Pages with no per-request data (homepage,
   about, contact) are pre-rendered at build time — served instantly, no
   server work per visit. Add `export const revalidate = 3600` to a page once
   it pulls real data from the DB, for ISR (rebuilds at most once an hour,
   still served instantly from cache in between).
2. **Link prefetching.** Every `<Link>` from `next/link` (used throughout
   `Header.tsx`, homepage, etc.) automatically prefetches the target page's
   code/data when it scrolls into view — by the time someone clicks, the page
   is usually already loaded. This is why "other pages should just open" is
   mostly free with Next.js, not something to hand-build.
3. **Loading/error boundaries.** `loading.tsx` and `error.tsx` give instant
   visual feedback during navigation instead of a blank screen.
4. **Cache headers.** `next.config.ts` sets long-lived immutable caching on
   hashed static assets, and explicitly disables caching on `/api/*` so form
   submissions are never served stale.
5. **Pagination is ready, not yet used.** `lib/pagination.ts` +
   `components/ui/Pagination.tsx` are built so that when you add an admin
   list of applications later, pages load a bounded number of rows instead
   of the whole table — keeps both the DB query and the page fast as data
   grows.

## Setting up locally

```bash
cp .env.example .env      # fill in DATABASE_URL, SMTP_*, LOAN_NOTIFY_EMAIL
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

## Deploying to cPanel

Same pattern as your other projects: build the app, run it as a persistent
Node process (PM2 or cPanel's "Setup Node.js App"), reverse-proxy through
Apache.

```bash
npm run build
npm run start   # or point cPanel's Node.js app at this, with npm start as the entry
```

Set `DATABASE_URL`, `SMTP_*`, `LOAN_NOTIFY_EMAIL`, and `NEXT_PUBLIC_SITE_URL`
as environment variables in cPanel's Node.js app config (not committed to
`.env`).

## What's deliberately left for later

- Real copy/design for Home, Loans, About, Contact
- Admin view of submitted applications (the `LoanApplication` model, Prisma
  client, and `Pagination` component are already there to support this)
- Auth for that admin view
- Migrating the in-memory rate limiter to Redis if you ever run more than
  one Node process for this app
