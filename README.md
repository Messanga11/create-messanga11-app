# create-messanga11-app

Scaffold a complete Next.js and Expo monorepo powered by the public
`@messanga11/core` GitHub release.

```sh
npx --yes github:Messanga11/create-messanga11-app#v0.4.1 my-app
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
Only routes explicitly declared in `packages/features/routes.config.json` are
generated. The Web and Mobile development servers hot-reload that registry and
create the physical Next.js/Expo Router page files without restarting, including
truthful per-page SEO.

The generated dependency on `@messanga11/core` is pinned to the immutable
`core-v0.2.1` release tarball. Core provides the validated design defaults and
each project keeps only its configurable overrides.

## Options

```sh
npx --yes github:Messanga11/create-messanga11-app#v0.4.1 my-app --no-install
```

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
