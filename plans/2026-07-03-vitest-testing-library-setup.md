---
title: Vitest + Testing Library setup and initial test suite
status: completed
created: 2026-07-03
updated: 2026-07-03
---

# Vitest + Testing Library setup and initial test suite

## Context
Phase 8 Task 24 of the dissertation project's larger plan: "Frontend: vitest +
testing-library; fix lint; remove --no-lint; lint+test CI jobs." This plan
covers ONLY the vitest/testing-library setup and writing real tests. A
teammate is handling lint fixes and CI/Dockerfile wiring in parallel in the
same repo — do NOT touch `.gitlab-ci.yml`, `Dockerfile`, or
`eslint.config.mjs`. Do NOT modify
`src/components/features/products/ProductList.tsx` (unrelated uncommitted
rework in progress there).

The repo (`micro-market-frontend`) is Next.js 15.2.4 App Router, React 19,
TypeScript 5, npm, and had ZERO test infrastructure at the start of this
task. `package.json` has no `"type"` field (CommonJS default); ESM-flavored
files like `eslint.config.mjs` are `.mjs` so that's independent of package
type. `tsconfig.json` has `baseUrl: "."` and `paths: {"@/*": ["./src/*"]}` —
vitest config must mirror this alias.

Key source files under test:
- `src/utils/logger.ts` — level-based logger (TRACE..SILENT), routes to
  `console.trace/debug/info/warn/error`, level configurable via
  `NEXT_PUBLIC_LOG_LEVEL` env var read at module load time, and via static
  `Logger.setLevel`/`getLevel`.
- `src/utils/api.ts` — `fetchWithTimeout` (timeout race, Keycloak auth
  header injection, 204 handling, non-JSON handling, `ApiError` building)
  and `handleApiError`. Depends on `@/auth/keycloak`'s `getKeycloak()` and
  `@/config/api`'s `API_TIMEOUT`.
- `src/services/api.ts` — axios instance (`api`, `apiService`) with request
  interceptor (injects `Authorization` header via `getKeycloak()`) and
  response interceptor (calls `keycloak.login()` on 401). Testable without
  hitting the network by passing a custom `adapter` function per-request in
  axios config (axios 1.x supports `config.adapter`), so we can intercept
  right after the request interceptor runs.
- `src/auth/roleUtils.ts` — pure-ish role extraction/check functions
  (`extractRoles`, `hasRole`, `isAdmin`, `isEditor`, `isUser`, `isGuest`,
  `getHighestRole`), branches on `tokenParsed.realm_access` vs
  `resource_access` vs profile fallback vs default `['user']`.
- `src/components/ui/Button.tsx`, `src/components/ui/Pagination.tsx` —
  presentational, RTL-testable (variants, disabled states, page click
  callbacks, ellipsis logic for >5 pages).
- `src/hooks/useProducts.ts` — wraps `@/services/productService`'s
  `getProducts`, manages loading/error/data/pagination state,
  `goToPage`/`nextPage`/`prevPage` clamping logic.
- `src/components/features/admin/AdminProductCard.tsx` — simpler
  presentational alternative to `ProductCard.tsx` (no auth-context
  coupling), has `window.confirm`-gated delete, edit callback, view link,
  in-stock/out-of-stock display. Chosen over `ProductCard.tsx` /
  `ProductList.tsx` to avoid the auth-context coupling and the
  do-not-touch file.

`src/services/api.ts`'s interceptors ARE unit-testable (not skipped) via the
custom-adapter trick above — no need to treat it as untestable.

## Tasks
- [x] 1. Install devDependencies: vitest, @vitejs/plugin-react, jsdom,
      @testing-library/react, @testing-library/jest-dom,
      @testing-library/user-event, @vitest/coverage-v8. Record actual
      installed versions. DISCOVERY: plain `npm install` hung / looped
      indefinitely with `UNABLE_TO_VERIFY_LEAF_SIGNATURE` because Norton
      Antivirus does local TLS interception with its own root CA
      (`Norton Web/Mail Shield Root`, present in the Windows
      LocalMachine\Root store) that Node's bundled CA list doesn't trust —
      same class of issue as the git `sslBackend=schannel` fix noted in
      memory. Fixed by exporting that cert to
      `<scratchpad>/norton-root.pem` and setting `NODE_EXTRA_CA_CERTS` to
      it for the npm install command. Installed versions: vitest 4.1.9,
      @vitejs/plugin-react 6.0.3, jsdom 29.1.1, @testing-library/react
      16.3.2, @testing-library/jest-dom 6.9.1, @testing-library/user-event
      14.6.1, @vitest/coverage-v8 4.1.9.
- [x] 2. Create `vitest.config.ts` at repo root (jsdom env, `@` alias to
      `./src`, setup file, include/exclude globs) and `vitest.setup.ts`
      (imports `@testing-library/jest-dom`). Chose `globals: false` +
      explicit `describe/it/expect/vi` imports in every test file
      (consistent convention, no tsconfig `types` change needed for
      vitest globals).
- [x] 3. Update `package.json`: add `"test": "vitest"` and
      `"test:run": "vitest run"` scripts (kept dev/build/start intact).
      Note: teammate's parallel lint-fix work had already changed the
      `lint` script to `eslint . --max-warnings=0` by the time this ran —
      left that untouched, only appended test/test:run.
- [x] 4. Update `tsconfig.json` only if needed for test type support
      (e.g. jest-dom matcher types) without breaking `next build`. NOT
      NEEDED — importing `@testing-library/jest-dom/vitest` in
      `vitest.setup.ts` provides the matcher type augmentation globally;
      `tsc --noEmit` is clean with tsconfig.json untouched.
- [x] 5. Write tests: `src/utils/logger.test.ts` (9 cases). Note: the
      `Logger` class is NOT exported from logger.ts (only `LogLevel`,
      `createLogger`, default instance) — level is controlled by setting
      `NEXT_PUBLIC_LOG_LEVEL` + `vi.resetModules()` + dynamic import
      per scenario, not via a `Logger.setLevel` call.
- [x] 6. Write tests: `src/utils/api.test.ts` (`fetchWithTimeout`,
      `handleApiError`, `ApiError`) — written, not yet run.
- [x] 7. Write tests: `src/services/api.test.ts` (interceptors via custom
      axios `adapter` config, axios 1.9.0 already a prod dependency) —
      written, not yet run.
- [x] 8. Write tests: `src/auth/roleUtils.test.ts` — written, not yet run.
- [x] 9. Write tests: `src/components/ui/Button.test.tsx` and
      `src/components/ui/Pagination.test.tsx` — written, not yet run.
- [x] 10. Write tests: `src/hooks/useProducts.test.ts` (mock
      `productService`, uses `renderHook`/`waitFor`/`act` from
      `@testing-library/react` 16.3.2) — written, not yet run.
- [x] 11. Write tests:
      `src/components/features/admin/AdminProductCard.test.tsx` — written,
      not yet run.
- [x] 12. Run `npm run test:run` until fully green. First run: 18/82
      failed, all with "Found multiple elements with role X" — root cause
      was `@testing-library/react`'s auto-cleanup never registering
      because it only self-registers when it finds a global `afterEach`
      at import time, and this config uses `globals: false`. Fixed by
      explicitly importing `cleanup` from `@testing-library/react` and
      calling it in an `afterEach` inside `vitest.setup.ts`. Second run:
      82/82 passed.
- [x] 13. Run `npx tsc --noEmit` until clean. First run: 3 errors in
      `src/services/api.test.ts` — the hand-built fake axios `adapter`
      response objects didn't satisfy `AxiosResponse`'s stricter
      `config.headers` typing. Fixed by typing `okAdapter` to return
      `Promise<AxiosResponse>` and casting the literal `as AxiosResponse`.
      Second run: clean, exit 0.
- [x] 14. Run `npm run build` to confirm production build still succeeds.
      First run failed with `UNABLE_TO_VERIFY_LEAF_SIGNATURE` — unrelated
      to the test setup itself, `next/font` fetches Google Fonts over the
      network at build time and hit the same Norton root-CA trust gap.
      Re-ran with `NODE_EXTRA_CA_CERTS` set to the exported cert — build
      succeeded (exit 0), all 11 routes generated, no test files/config
      pulled into the bundle.
- [x] 15. Final report delivered to requester with versions, file list,
      test counts, and `test:run`/`tsc`/`build` results.

## Resume notes
Plan complete. Status set to completed below. Summary for any future
session: 8 test files, 82 passing tests, `tsc --noEmit` clean, `npm run
build` succeeds. Two environment gotchas were discovered and fixed along
the way (see Verification section and task 1/14 notes) — both are TLS
trust issues from Norton Antivirus's local certificate, not code issues.

IMPORTANT for any future session on this machine: if `npm install` (or any
Node process needing outbound HTTPS, including `next build`'s
`next/font` fetch) hangs or fails with `UNABLE_TO_VERIFY_LEAF_SIGNATURE`
/ near-zero CPU usage, it's Norton Antivirus's local TLS-inspection root
cert (`Norton Web/Mail Shield Root`, present in the Windows
LocalMachine\Root store) not being in Node's trust store — the same class
of issue as the git `sslBackend=schannel` fix noted in memory. Fix: export
that cert and set `NODE_EXTRA_CA_CERTS=<path to the PEM>` for the command.
Export via PowerShell:
`Get-ChildItem Cert:\LocalMachine\Root | Where-Object Subject -match "Norton"`
then convert `.RawData` to base64 and wrap in
`-----BEGIN CERTIFICATE-----`/`-----END CERTIFICATE-----`. The PEM used in
this session was a scratchpad temp file, not persisted in the repo.

## Verification
- `npm run test:run` — all test files pass, no `expect(true).toBe(true)`
  filler assertions.
- `npx tsc --noEmit` — no type errors introduced by test files or
  `vitest.config.ts`/`vitest.setup.ts`.
- `npm run build` — Next.js production build succeeds unchanged, confirming
  test infra isn't pulled into the app bundle.
