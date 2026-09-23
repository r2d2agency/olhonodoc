# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start the Next.js development server.
- `npm run build` — generate Prisma Client and create the production build.
- `npm start` — generate Prisma Client and run the production server.
- `npm run lint` — run the configured Next.js lint command.
- `npx tsc --noEmit` — type-check without emitting files.
- `npm run db:generate` — regenerate Prisma Client after schema changes.
- `npm run db:push` — apply the Prisma schema directly to the configured PostgreSQL database.
- `npm run db:seed` — run the idempotent seed script.
- `npm run db:create-admin` — create/update the initial superadmin using the environment variables documented in `prisma/create-admin.ts`.
- `npm run release` — generate Prisma Client, push the schema, seed the database, and build.

This repository does not currently define a test script or test runner. Use `npx tsc --noEmit`, `npm run lint`, and `npm run build` as the baseline verification commands.

## Architecture

This is a Next.js 14 App Router application using TypeScript, React 18, Prisma 6, and PostgreSQL. Public pages live under `app/`; route handlers are colocated under `app/api/`. Shared public UI is in `components/site.tsx`, product catalog data/helpers are under `data/` and `lib/`, and global styling is split between `app/globals.css` and the admin stylesheet `app/admin.css`.

The admin is a protected route tree under `app/admin`. `app/admin/layout.tsx` calls `requireAdmin()` and wraps pages in `AdminShell` from `components/admin-shell.tsx`; superadmin-only mutations should use `requireSuperadmin()`. The sidebar currently links both implemented modules and placeholder modules. Dynamic fallback routing is in `app/admin/[...slug]/page.tsx`, so explicit functional routes must be handled before relying on the placeholder map in `app/admin/placeholder-pages.ts`.

Authentication is email-code/session based. `lib/auth.ts` normalizes email, creates and validates OTP codes/sessions, and reads the `olhonodoc_session` cookie. Auth route handlers are under `app/api/auth`; admin mutations must not trust client role state and must check the server-side session.

Prisma uses PostgreSQL with `DATABASE_URL`. The schema in `prisma/schema.prisma` contains users/roles, sessions/auth codes, products/orders/customers, coupon models, `Setting` for JSON singleton configuration, and `HomeSection` for ordered/active home CMS blocks. `lib/prisma.ts` is the shared Prisma client. Existing admin settings such as brand, media, and home configuration use allowlisted `Setting` keys; preserve fallbacks when the database is unavailable or unconfigured.

The home CMS is split across `lib/home-cms.ts`, `app/api/admin/home/route.ts`, and `app/admin/site/home/page.tsx`. The public home is currently primarily composed in `app/page.tsx` using reusable components from `components/site.tsx`; when extending CMS functionality, keep the public fallback usable with an empty database and validate URLs/JSON before rendering.

Brand configuration is stored under the `brand` setting and has defaults in `lib/brand.ts`. Keep logo/color data centralized rather than hardcoding separate admin and public copies. Local image uploads currently use data URLs, so retain size/type limits and avoid treating arbitrary input as HTML/CSS.

## Data and API conventions

Admin route handlers use `NextResponse`, Prisma, and auth guards. Validate and normalize request payloads server-side, return JSON errors with appropriate status codes, and use transactions for multi-record updates. Prefer existing Prisma models and `Setting`/`HomeSection` patterns before introducing new storage. Any new schema requires `npm run db:generate` and either a migration workflow or the project’s configured `npm run db:push` process.

Admin UI should use the shared shell and existing admin primitives/styles. Keep forms responsive: grids must use `minmax(0, 1fr)`, children must have `min-width: 0`, and editors must collapse below tablet width so they never create viewport-wide horizontal overflow. Use explicit classes for buttons, cards, fields, tabs, loading, error, and empty states rather than relying on browser-default controls.

## Environment

Required database configuration is `DATABASE_URL`. Email OTP flows may require the SMTP variables read by the auth route handlers. The deployment build uses Next standalone output; external images require an allowed `remotePatterns` entry in `next.config.mjs` or should remain local/data URLs.
