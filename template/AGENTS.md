# Project guardrails

- Shared schemas, policies and view-models live in `packages/domain`.
- Web-only rendering and server composition live in `apps/web`.
- Native rendering and device integrations live in `apps/mobile`.
- Never trust tenant, actor or permissions supplied by a client.
- Enforce authorization through `@messanga11/core/server`; UI decisions are advisory.
- Search existing symbols with `rg` before creating a new pattern.
- Run `npm run typecheck`, `npm test` and both builds before handoff.
