export { router } from "./routes";
export {
  ALL_ROUTE_WIRING,
  AUTH_WIRING,
  APP_ROUTE_WIRING,
  ONBOARDING_WIRING,
  SETTINGS_WIRING,
  type RouteWiring,
} from "./routeRegistry";

/**
 * Nirmiti CMS — app entry (router + route registry exports).
 *
 * Exported wiring maps (see routeRegistry.ts):
 * - AUTH_WIRING        — login, register, logout
 * - ONBOARDING_WIRING  — setup (before first project)
 * - APP_ROUTE_WIRING   — main app pages under AppLayout
 * - SETTINGS_WIRING    — nested /settings pages
 * - ALL_ROUTE_WIRING   — full list in navigation order (docs / backend onboarding)
 *
 * Attach backend to any page — follow this order, then verify the matching row in routeRegistry.ts:
 * 1. src/lib/api/<module>/<file>.ts
 * 2. src/lib/storage/apiRepository.ts
 * 3. src/hooks/useAppData.ts
 * 4. src/app/routePages.tsx
 * 5. src/app/routeRegistry.ts
 * 6. src/app/routes.tsx
 * 7. UI component under src/components/pages/
 *
 * Guards: src/app/guards.tsx only (not part of this checklist).
 */