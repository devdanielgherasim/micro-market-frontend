# micro-market-frontend

Next.js 15 (App Router) / React 19 / TypeScript frontend for the microservices
demo. Talks to the `catalog` (8088), `orders` (8090) and `audit` (8089) Quarkus
services over REST, with Keycloak-based auth and role-gated UI.

## Routes

| Route | Notes |
|---|---|
| `/` | Public landing/home page |
| `/dashboard` | Authenticated user dashboard |
| `/products`, `/products/[id]` | Product catalog browsing / detail |
| `/orders` | Current user's orders |
| `/audit` | Audit log viewer |
| `/admin/products`, `/admin/orders`, `/admin/audit` | Admin-gated management tree |

Routing is plain App Router under `src/app`; the `/admin/*` tree is not a
separate auth layer in Next.js middleware — access is enforced at the
component level (see below).

## Auth

- `src/auth/keycloak.ts` — a browser-only Keycloak singleton (guards against
  double-init in React's dev-mode double-render).
- `src/auth/KeycloakProvider.tsx` — React context wrapping that singleton;
  exposes `isAuthenticated`, `userProfile`, `tokenParsed`, `login`/`logout`.
  Instance is tracked via `useRef` (not a `keycloak` state dependency) in the
  init/cleanup effect specifically to avoid a stale-closure re-init loop.
- `src/auth/roleUtils.ts` — `UserRole` enum (`guest` / `user` / `editor` /
  `admin`), extracted from the JWT's `realm_access.roles` first, falling back
  to `resource_access[clientId].roles` (or any client's roles found), then the
  Keycloak profile, defaulting to `user` if authenticated with no roles found
  at all.
- `src/components/auth/RoleBasedAccess.tsx` / `RoleBasedRoute.tsx` — UI-level
  gating components built on `hasRole`/`isGuest` from `roleUtils`; this is how
  the `/admin/*` tree and role-specific UI elements are actually protected
  (client-side only — the backend services are the real authorization
  boundary).

## API layer

- `src/config/api.ts` — builds `API_ENDPOINTS` from `NEXT_PUBLIC_API_URL`.
  If that env var is unset, it falls back to `http://localhost:8088/8090/8089`
  for products/orders/audit respectively (matching catalog/orders/audit's
  local dev ports) and logs a console warning.
- `src/services/api.ts` — a shared axios instance: injects
  `Authorization: Bearer <token>`, refreshes via `keycloak.updateToken(30)`
  before requests, and forces `keycloak.login()` on a 401.
- `src/services/{product,order,audit}Service.ts` +
  `src/hooks/use{Product(s),Orders,AuditLogs}.ts` — one thin
  service/hook pair per backend service, all built on the shared api layer.
- Logging goes through `src/utils/logger.ts` (`createLogger(scope)`), not raw
  `console.*` — this is the one file exempted from the `no-console` lint rule.

## Local development

```shell
npm run dev        # next dev
npm run build      # next build
npm run start      # next start
npm run lint       # eslint . --max-warnings=0
npm test           # vitest (watch mode)
npm run test:run   # vitest run (CI mode)
```

Requires `NEXT_PUBLIC_API_URL` (and Keycloak-related `NEXT_PUBLIC_*` vars) for
anything beyond the bare localhost fallback described above.

**`lint` runs plain ESLint directly, not `next lint`.** `next lint`'s CLI is
broken under this repo's eslint 8.57 + flat-config + `eslint-config-next`
combination (it throws `Invalid Options` on invocation). `next.config.ts` sets
`eslint: { ignoreDuringBuilds: true }` with a comment documenting the same
reasoning: linting is enforced as its own CI stage ahead of the build, not
re-run inside `next build`.

## Testing

Vitest + `@testing-library/react`/`jest-dom`/`user-event`, configured in
`vitest.config.ts` / `vitest.setup.ts` (jsdom environment). Currently 8 test
files, 82 tests, all passing (`npm run test:run`):

- `src/utils/logger.test.ts` — the `createLogger`/`Logger` console wrapper.
- `src/utils/api.test.ts` — `fetchWithTimeout` and `handleApiError`.
- `src/services/api.test.ts` — the shared axios instance's request/response
  interceptors (token injection, refresh, 401 redirect).
- `src/auth/roleUtils.test.ts` — role extraction/`hasRole`/`getHighestRole`
  logic.
- `src/components/ui/Button.test.tsx`, `src/components/ui/Pagination.test.tsx`
  — presentational UI components.
- `src/hooks/useProducts.test.ts` — the products data-fetching hook.
- `src/components/features/admin/AdminProductCard.test.tsx` — an admin
  feature component.

## CI/CD

CI runs on GitHub Actions (`.github/workflows/ci.yml`; migrated from GitLab
CI, see `Sources/plans/2026-07-08-gitlab-to-github-migration.md`), giving
this repo the same supply-chain shape as the Java services:

- **test**: this repo's own `lint` and `test` jobs (npm, `node:20-alpine`).
- **security-scan-gate**: calls the reusable workflow in
  `devdanielgherasim/micro-market-utilities` — CodeQL (HIGH/CRITICAL severity
  gate), gitleaks, dependency-review.
- **build-and-push**: logs into the cloud registry via the shared
  `cloud-registry-login` composite action (OIDC), runs `./build.sh`, then
  resolves the pushed image reference/digest via `resolve-image-ref`.
- **image-supply-chain**: calls the reusable workflow in `utilities` — Trivy
  CRITICAL-severity gate, Syft CycloneDX SBOM, cosign keyless sign + SBOM
  attestation (GitHub's own OIDC token, no separate audience token needed),
  `cosign verify`, then a `repository_dispatch` trigger that hands the built
  image's tag to the `deployment` repo's promotion workflow.

`build.sh` is cloud-provider-aware (`CLOUD_PROVIDER=aws|azure|gcp`), resolving
the registry host and per-cloud image path layout (ECR / ACR / Artifact
Registry) the same way the other service repos do. `PROJECT_NAMESPACE`
defaults to `danielgherasim-microservices` consistently across `ci.yml` and
`build.sh` in this repo.

## Build

`Dockerfile` is a two-stage `node:20-alpine` build producing a Next.js
`standalone` output, run as a non-root `nextjs` user. It no longer passes
`--no-lint` to `next build` — linting was moved out to its own CI `test`-stage
job (see above), so the build stage just builds.

## Known inconsistencies / in-progress state

- `src/components/features/products/ProductList.tsx` currently has an
  **uncommitted working-tree change** — a pure reformatting/import-ordering
  pass (no behavior change), left mid-flight intentionally. Do not touch this
  file as part of unrelated work; it's an explicitly parked, separate rework.
- The `PROJECT_NAMESPACE`/image-path drift noted elsewhere in this project's
  history (`microservices1691717` vs `...715` vs `...716`) is **not** present
  in this repo's current `build.sh`/`.github/workflows/ci.yml` — both
  consistently use `danielgherasim-microservices`.
