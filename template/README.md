# __PROJECT_NAME__

Next.js and Expo monorepo powered by `@messanga11/core`.

## Start

```sh
npm run dev:web
```

In another terminal:

```sh
npm run dev:mobile
```

For a physical device, copy `.env.example` to `.env` and replace `localhost`
with the LAN address of the machine running Next.js.

## Architecture

```text
apps/web       Next.js App Router and trusted server composition
apps/mobile    Expo Router and native rendering
packages/domain  Shared schemas, policies and semantic view-models
packages/design-system  Shared semantic tokens for Web and Native
packages/features  Shared UI composition, state and actions
packages/navigation  Validated Web/Mobile route and SEO generator
packages/ui-engine  Renderer-neutral primitive contracts
packages/ui-web  Browser engine implementation
packages/ui-native  React Native engine implementation
```

Design rules and configuration live in `DESIGN.md`. Core provides the defaults;
change project overrides in `packages/design-system/design.config.json`, then run
`npm run design:sync`.

`@messanga11/core/testing` is suitable only for tests and local prototypes.
Before adding mutations, implement production identity, authorization, quota,
rate-limit and audit ports in the trusted Web server boundary.

Feature screens are authored once in `packages/features`. Declare each real screen
in `packages/features/routes.config.json`; do not create page files by hand. The
development commands watch this registry and generate the thin Next.js and Expo
Router adapters automatically:

```sh
npm run routes:generate
npm run routes:check
```

Each Web declaration contains its truthful title, description, canonical path and
indexing decision. The generator also maintains `robots.txt`, `sitemap.xml`, the
Web manifest and framework error/not-found routes. Copy `.env.example` to `.env`
and set `NEXT_PUBLIC_SITE_URL` to the public Web origin before deployment.
