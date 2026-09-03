# __PROJECT_NAME__

Next.js and Expo monorepo powered by `@messanga11/core`.

## Start

```sh
npm run dev:web
```

This project was generated with the `__PRESET__` capability preset. Change the
selection in `packages/features/src/preset.ts`, then run `npm run routes:generate`;
the compiler will add and remove the corresponding Web and Mobile routes.

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

The `/formulaire` feature demonstrates the renderer-neutral FormBuilder with OTP,
phone, async country choice, roles, conditional fields, repeatable members,
date range/timezone, document metadata and a review step. Web orchestration uses
Refine.dev and persists to `.data/demo.sqlite`; Expo submits to the same Next API
through `EXPO_PUBLIC_API_URL`.

SQLite is development-only. The API validates a strict JSON payload and an
allowlisted resource. Replace the development adapter and demo identity boundary
before production deployment.

The Refine-style Orders, Customers, Products, Categories, Stores and Couriers
screens are backed by generated operations rather than static UI actions. Their
list/create/update/delete flows persist in `.data/demo.sqlite`. Each resource is
declared beside its page in `packages/features/src/app.feature.ts`; Core derives
the CRUD contracts and the server derives its SQLite field allowlist and seed from
that same declaration.

Design rules and configuration live in `DESIGN.md`. Core provides the defaults;
change project overrides in `packages/design-system/design.config.json`, then run
`npm run design:sync`.

`@messanga11/core/testing` is suitable only for tests and local prototypes.
Before adding mutations, implement production identity, authorization, quota,
rate-limit and audit ports in the trusted Web server boundary.

Feature screens are authored once in `packages/features`. Declare every feature,
page, layout, block, route, SEO contract and backend operation in
`packages/features/src/app.feature.ts`; do not create page or API files by hand. The
development commands hot-reload this registry and generate the thin Next.js and
Expo Router adapters without restarting the server:

```sh
npm run routes:generate
npm run routes:check
npm run routes:watch
```

Each Web declaration contains its truthful title, description, canonical path and
indexing decision. The generator also maintains `robots.txt`, `sitemap.xml`, the
Web manifest and framework error/not-found routes. Copy `.env.example` to `.env`
and set `NEXT_PUBLIC_SITE_URL` to the public Web origin before deployment.

The backend uses the same compiled catalog. Requests to undeclared features or
operations are rejected. Declared operations enforce method, strict input/output
schemas, access policy, rate limiting, audit and idempotency before invoking an
injected handler. SQLite remains a development adapter, not part of the feature API.

To plug in a future domain, declare a resource and call
`createFeatureCrudOperations`, or declare a custom operation with a stable handler
identifier. Implement custom handlers only in the trusted server composition.
Provider adapters implement Core ports; feature and UI packages never import a
database, OIDC vendor or framework server type.
