# Project guardrails

- Read `DESIGN.md` before changing any Web or Native interface.
- Treat `@messanga11/core/design` as the token source and `packages/design-system/design.config.json` as project overrides.
- Run `npm run design:sync` after changing design tokens.
- Shared schemas, policies and view-models live in `packages/domain`.
- Renderer adapters and project overrides live in `packages/design-system`; components remain platform-specific.
- Web-only rendering and server composition live in `apps/web`.
- Native rendering and device integrations live in `apps/mobile`.
- Never write intrinsic JSX elements such as `div`, `span`, `p`, `button`, `input`, `select`, `main` or headings in Web application code. Compose `@starter/ui-web` primitives.
- Add missing browser semantics once inside the Web design-system adapter, then consume the new primitive everywhere.
- Never trust tenant, actor or permissions supplied by a client.
- Enforce authorization through `@messanga11/core/server`; UI decisions are advisory.
- Search existing symbols with `rg` and ingest only the closest relevant snippets before creating a pattern.
- Do not introduce raw colors, spacing or radii when an existing semantic token applies.
- Keep keyboard, screen-reader, reduced-motion and 44px touch-target behavior intact.
- Run `npm run typecheck`, `npm test` and both builds before handoff.
