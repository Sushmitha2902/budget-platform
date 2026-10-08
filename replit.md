# Indian Union Budget Analysis Platform

A full-stack platform for exploring 14 years (2013–14 to 2026–27) of Indian Union Budget data across 10 sectors, with interactive charts, anomaly detection, and year-wise analysis. Data is sourced from 130,500 OCR-extracted rows stored in a SQLite database.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, proxied at `/api`)
- `pnpm --filter @workspace/budget-dashboard run dev` — run the frontend (Vite dev server)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm run typecheck:libs` — build composite libs (run after editing any `lib/*` package)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- **API**: Express 5, `better-sqlite3` (read-only access to SQLite), pino structured logging
- **DB**: SQLite at `outputs/db/budget.db` — table `budget_data`, filter on `attribute = 'value_1'`
- **Frontend**: React 19, Vite 7, Tailwind CSS 4, Recharts, TanStack Query v5, wouter
- **API contract**: OpenAPI 3.1 spec → Orval codegen → typed React Query hooks in `lib/api-client-react`
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **Build**: esbuild (CJS bundle for API server)

## Where things live

| Path | Purpose |
|------|---------|
| `artifacts/api-server/src/routes/budget.ts` | All `/budget/*` route handlers |
| `artifacts/api-server/src/routes/export-route.ts` | `/export/csv/:year` CSV download |
| `artifacts/api-server/src/routes/pipeline-route.ts` | `/pipeline/status` DB health |
| `artifacts/api-server/src/lib/budget-db.ts` | SQLite connection, YEARS/SECTORS constants, source mapping |
| `lib/api-spec/openapi.yaml` | **Source of truth** for all API contracts |
| `lib/api-client-react/src/generated/` | Orval-generated hooks (do not edit manually) |
| `artifacts/budget-dashboard/src/pages/` | Frontend pages (dashboard, year, sector, anomaly, compare, pipeline) |
| `artifacts/budget-dashboard/src/components/charts.tsx` | All Recharts components |
| `outputs/db/budget.db` | SQLite database (read-only, 19 MB, 130,500 rows) |

## Architecture decisions

- **SQLite read-only**: The backend opens `budget.db` in readonly mode — no writes, no migrations needed. All reads go through `better-sqlite3` synchronous API.
- **Contract-first API**: OpenAPI spec → Orval → typed hooks. Never add API routes without updating the spec and running `codegen`.
- **YEAR_SOURCE_MAP**: Each budget year maps to one or two source document identifiers (e.g., `budget_glance_2024_25`). Source filtering is the key join mechanism — there is no `year` column in the DB.
- **Accuracy score**: Weighted composite = name validity (30%) + numeric coverage (25%) + sector classification (30%) + anomaly-free rows (15%). Values returned as 0–100 from the API (already a percentage).
- **Path routing**: The shared proxy routes `/api/*` to the API server and `/` to the Vite frontend. Never hardcode ports in app code.

## Product

**Pages:**
- `/` — Dashboard: KPI cards, sector bar chart, pie, 14-year trend line, heatmap, accuracy panel
- `/years` — Browse all 14 budget years as cards with summary stats + CSV download links
- `/year/:year` — Deep-dive into a single year: KPIs, top schemes table, anomaly table
- `/sector/:sector` — Sector view: Budget Glance + Expenditure trends, all schemes
- `/anomalies` — Filtered anomaly browser with year/sector selectors
- `/compare` — Side-by-side grouped bar chart + change table for any two years
- `/pipeline` — DB health status, row count, technical notes

## User preferences

- Standard, complete project structure with no placeholder data
- All accuracy values are already percentages (0–100) — do NOT multiply by 100 in the frontend

## Gotchas

- `YEAR_SOURCE_MAP` in `budget-db.ts` maps year strings to source document name prefixes. If a year has no sources, its data is empty — this is expected for future years.
- `better-sqlite3` requires native build scripts. It must be in `onlyBuiltDependencies` in `pnpm-workspace.yaml`.
- The `AccuracyMetrics` API response fields (`accuracy`, `valid_names_pct`, etc.) are already percentages (e.g., `91.39`). Display as-is — don't multiply by 100.
- `req.params` in Express 5 routes must be accessed with `String(req.params["key"])` to satisfy TypeScript strictness (`TS2538`).
- The heatmap endpoint runs N×M SQLite queries (sectors × years = 10×14 = 140). It's the slowest endpoint (~1.5s). Cache headers help after the first load.

## Pointers

- See `.local/skills/pnpm-workspace` for workspace structure and TypeScript setup
- See `.local/skills/pnpm-workspace/references/server.md` for Express route conventions and logging
- See `.local/skills/pnpm-workspace/references/openapi.md` for codegen workflow
