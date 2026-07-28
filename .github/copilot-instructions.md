# Copilot Instructions

This repo is a Next.js App Router application built around Supabase authentication and data access.

- `app/` is the primary entrypoint. `page.tsx` is the public landing page, while `app/home/page.tsx` is the authenticated section.
- Server-side Supabase access is centralized in `lib/supabase/server.ts`; browser-side access uses `lib/supabase/client.ts`.
- API routes live in `app/api/*/route.ts` and use Next.js Route Handlers with `Request` and `Response.json()`.
- Auth state is handled via Supabase cookies and server-side claims. `components/auth-button.tsx` calls `supabase.auth.getClaims()` and `lib/supabase/proxy.ts` keeps session cookies in sync.
- Use `createClient()` from `lib/supabase/server.ts` inside every request or server component; do not reuse a global Supabase client in server code.
- Client form components must include `"use client"` and use `lib/supabase/client.ts` for browser auth flows, e.g. `components/login-form.tsx`, `components/sign-up-form.tsx`, `components/update-password-form.tsx`.

## Key patterns

- `app/api/projects/route.ts` demonstrates paging, filtering, sorting, and CRUD operations via `supabase.from('projects')`.
- `app/home/page.tsx` is guarded: it uses server-side claims and redirects unauthenticated visitors to `/auth/login`.
- UI components are built with shadcn-style wrappers in `components/ui/*` and imported directly with `@/components/ui/...`.
- Environment variables are required for Supabase: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

## Workflow commands

- `npm run dev` — start local development server.
- `npm run build` — build the app.
- `npm run start` — run production build.
- `npm run lint` — run ESLint across the repository.

## What to avoid

- Don’t invent separate backend services; data access is through Supabase and Next.js route handlers in `app/api/`.
- Don’t add server-side Supabase clients as globals; each request should call `createClient()` fresh.
- Don’t assume tests exist; there is no test runner configured in `package.json`.

## Useful files

- `package.json` — scripts and dependency surface.
- `app/page.tsx` — public landing page and environment warning flow.
- `app/home/page.tsx` — authenticated home route.
- `components/login-form.tsx` — client-side Supabase sign-in flow.
- `lib/supabase/server.ts` — server-side Supabase client wrapper.
- `lib/supabase/proxy.ts` — cookie/session sync and auth redirect logic.
- `app/api/projects/route.ts` — example of collection CRUD and query params.
