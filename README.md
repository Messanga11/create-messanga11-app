# create-messanga11-app

Scaffold a complete Next.js and Expo monorepo powered by the public
`@messanga11/core` GitHub release.

```sh
npx --yes github:Messanga11/create-messanga11-app#v0.9.0 my-app
```

No GitHub or npm token is required. The generated project contains:

```text
apps/web          Next.js 16 App Router
apps/mobile       Expo 57 Router
packages/domain   shared schemas, policies and protected operations
packages/design-system  shared Web and Native design tokens
packages/features  shared UI composition, state and actions
packages/navigation validated page, route and SEO generation
packages/ui-engine  renderer-neutral primitive contracts
packages/ui-web     browser engine
packages/ui-native  React Native engine
```

Every scaffold includes `AGENTS.md` guardrails and a complete `DESIGN.md`
covering token configuration, platform components and accessibility.
UI features are written once in `packages/features`. Applications only select
their renderer engine; raw HTML and React Native primitives stay inside adapters.
Only routes explicitly declared in `packages/features/src/app.feature.ts` are
generated. The Web and Mobile development servers hot-reload that registry and
create the physical Next.js/Expo Router page files without restarting, including
truthful per-page SEO.

The generated dependencies are pinned to the immutable public `core-v0.5.0`
release assets. The scaffold includes the shared complex FormBuilder, the
Refine.dev Web adapter and the SQLite development adapter. Core provides the
validated contracts and design defaults; each project keeps its renderers and
configurable design overrides.

The default catalog demonstrates a Refine Finefoods-compatible administration
surface: analytical dashboard, orders, customers, products, categories, stores,
couriers, invoices, team management, notifications, profile and settings. The
same declarative feature data renders through the Web and Native engines.

## Options

```sh
npx --yes github:Messanga11/create-messanga11-app#v0.9.0 my-app --preset commerce
npx --yes github:Messanga11/create-messanga11-app#v0.9.0 my-app --no-install
```

Available allowlisted presets are `saas`, `admin`, `commerce`, `delivery`,
`booking`, `marketplace`, `content` and `custom`. The preset filters the compiled
feature catalog; route generation then removes outputs that are no longer declared.

Project names accept lowercase letters, numbers and hyphens. Existing non-empty
directories are never overwritten.

## Generated project

```sh
cd my-app
npm run dev:web
```

In another terminal:

```sh
npm run dev:mobile
```

Validate everything with:

```sh
npm run typecheck
npm test
npm run build
```
