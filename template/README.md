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
```

`@messanga11/core/testing` is suitable only for tests and local prototypes.
Before adding mutations, implement production identity, authorization, quota,
rate-limit and audit ports in the trusted Web server boundary.
