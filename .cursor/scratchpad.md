# SurgePay Dashboard — Production UI & Backend Integration

## Background and Motivation

The SurgePay analytics dashboard (`surgepay-dashboard`, Next.js 14 App Router) surfaces transaction metrics from Supabase (`wallet_transactions`, `users`), static app download counts from env, and optional on-chain tooling. The product goal is a **production-grade** dashboard: cohesive visual design (typography, spacing, density, loading/error/empty states) and **accurate** integration where every widget’s TypeScript types and fetch logic match the real API responses.

## Key Challenges and Analysis

1. **Inconsistent HTTP semantics when Supabase is missing** — **Resolved (Task 1):** dashboard routes now use `503` + `{ error }` where appropriate; clients use `safeFetch` and typed payloads.

2. **`/api/wallets/all` mis-shapes “not configured”** — **Resolved (Task 1):** no longer returns `data: []` for that case.

3. **Mixed fetch patterns** — **Resolved (Task 1):** dashboard widgets use `safeFetch` consistently.

4. **Refresh model** — Parent remounts children via `key={\`…-${refreshKey}\`}`; still valid.

5. **UI baseline** — **Resolved (Tasks 2–4):** fonts, sections, empty states, layout.

6. **Automated tests** — **Resolved (Task 5):** Vitest for `safeFetch`, `isBackendUnavailableError`, and small formatters.

## High-level Task Breakdown

Each task has verifiable success criteria. Executor completes **one task per cycle** and records progress below.

### Task 1 — API contracts + client alignment (backend-facing)

- **Scope:** Dashboard GET routes that read Supabase for the main page: `transactions/recent`, `transactions/stats-by-currency`, `transactions/stats-by-type`, `wallets/all`. When `!isSupabaseConfigured`, respond with **`503`** and `{ error: string }` (align with `overview` / `users/stats`). Remove misleading `200` + `error` + empty `data` for those cases.
- **Scope:** Add `lib/api-types.ts` with exported interfaces matching JSON payloads (overview row, stats rows, wallets payload, users stats, app downloads, recent tx + pagination).
- **Scope:** Use `safeFetch` in `AllWalletsOnBase` and `AppDownloads`; add proper error UI to `CurrencyPieChart` consistent with other widgets.
- **Success criteria:** `npm run build` and `npm run lint` pass; unconfigured Supabase yields visible, accurate error states (not silent empty charts/tables); no invalid `data: []` object shape for wallets.

### Task 2 — Design system baseline (shell + tokens)

- **Scope:** `next/font` (e.g. DM Sans + JetBrains Mono for addresses), refine `globals.css` / Tailwind layer for surface colors, borders, and reusable `.dashboard-card`, skeleton patterns.
- **Scope:** `DashboardShell` / `DashboardSection` (title, description, optional actions) used on `app/page.tsx`.
- **Success criteria:** Visual consistency across sections; readable hierarchy; dark mode still coherent (media-based or documented).

### Task 3 — Page layout and density

- **Scope:** Responsive grid (e.g. KPI row, charts row, tables), sticky header behavior, improved empty/loading skeletons per section.
- **Success criteria:** No horizontal overflow on common breakpoints; charts and tables share spacing rhythm.

### Task 4 — Widget polish and data accuracy pass

- **Scope:** Re-read each API route vs component; fix any field mismatches; tier cards in `AllWalletsOnBase` if we expose `tier*_verified` from `users/stats`; pie chart edge cases (zero total).
- **Success criteria:** Manual spot-check checklist in Executor notes; types imported from `lib/api-types.ts` in components where practical.

### Task 5 — Tests (optional follow-up)

- **Scope:** Add Vitest (or project-standard runner) for `safeFetch` and/or small pure formatters.
- **Success criteria:** `npm test` passes in CI.

## Project Status Board

- [x] Task 1 — API contracts + client alignment
- [x] Task 2 — Design system baseline *(DM Sans + JetBrains Mono, tokens, `DashboardSection`, `EmptyState`)*
- [x] Task 3 — Page layout and density *(sticky header, section rhythm, chart/table styling)*
- [x] Task 4 — Widget polish *(audience-safe copy: no Supabase/.env on screen; dev-only `devDetail`; downloads empty when unset; pie zero-total; tier KPI row)*
- [x] Task 5 — Automated tests *(Vitest: `lib/*.test.ts`, `npm test`)*

## Current Status / Progress Tracking

- **Planner:** Initial plan recorded (2026-04-08).
- **Executor (2026-04-08):** Completed Task 1 — standardized Supabase-unconfigured responses to **503** on `transactions/recent`, `stats-by-currency`, `stats-by-type`, `wallets/all`; added `lib/api-types.ts`; migrated dashboard widgets to typed `safeFetch` where applicable; fixed pie chart error UX; fixed `safeFetch` generic usage (T = payload of the `data` field). **Build/lint:** Added `.eslintrc.json` (avoids interactive `next lint`); fixed `react/no-unescaped-entities` in `ActiveWallets` / `WalletInfo`; fixed JSDoc backticks in `api-types.ts` that broke the ESLint parser. **Alchemy:** Replaced eager `throw` in `lib/alchemy.ts` with `getAlchemy()` so `next build` works without `ALCHEMY_TOKEN`; `/api/wallets/info` and `/api/wallets/active` return 503 when unset; removed unused `alchemy` import from `metrics/route.ts`.
- **Executor (2026-04-08, UI pass):** Production UI — `next/font` (DM Sans, JetBrains Mono) in `app/layout.tsx`; Tailwind `fontFamily` + `shadow-panel`; refined `.card` / `.stat-card` in `globals.css`; `components/DashboardSection.tsx`; `components/ui/EmptyState.tsx` + `lib/dashboard-empty.ts` (`isBackendUnavailableError`); `Header` sticky + refresh contrast; `page.tsx` restructured with neutral section copy (no “Supabase” in user-facing text). All data widgets use `EmptyState` variants; raw errors only via `devDetail` in **development**. **App downloads:** single empty state when both store counts unset (no placeholder `0` grid). **Charts:** empty slices and tooltips safe for zero totals. **Wallets:** tier KPI row + muted cards; user stats fallback banner; responsive `shortenAddress`. `npm run lint` + `npm run build` pass.
- **Executor (2026-04-08, Task 5):** Added **Vitest** (`vitest`, `vitest.config.ts` with `@/*` alias), scripts `npm test` / `npm run test:watch`. Tests: `lib/dashboard-empty.test.ts` (`isBackendUnavailableError`), `lib/utils.test.ts` (`formatNumber`, `shortenAddress`, `safeFetch` with mocked `fetch`). `npm audit fix` run; remaining advisories mostly need major upgrades (e.g. Next 16) — not applied without explicit approval.

## Executor's Feedback or Assistance Requests

- **Project status:** All scratchpad tasks (1–5) are implemented. **Planner:** confirm closure when satisfied.
- **DevRel / preview env:** UI stays calm when the backend is disconnected; `devDetail` only in development.

## Lessons

- Read the file before editing.
- Include useful debugging context in server `console.error` for API routes.
- If `npm audit` reports critical issues during work, run audit and address before merging.
- `safeFetch<T>` types **T** as the **value of the JSON `data` property**, not the whole response body; using `safeFetch<{ data: Foo }>` makes `result.data` incorrectly nested in TypeScript.
- Avoid nested backticks inside `/** */` comments if ESLint’s TS parser reports “Unterminated template literal”.
- Eager `throw` in modules imported by API routes breaks `next build` page-data collection; use lazy initialization (e.g. `getAlchemy()`) instead.
- Vitest needs `resolve.alias` in `vitest.config.ts` to match Next’s `@/*` path imports in test files.
