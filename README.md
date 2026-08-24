# create-messanga11-app

Scaffold a complete Next.js and Expo monorepo powered by the public
`@messanga11/core` GitHub release.

```sh
npx --yes github:Messanga11/create-messanga11-app#v0.1.1 my-app
```

No GitHub or npm token is required. The generated project contains:

```text
apps/web          Next.js 16 App Router
apps/mobile       Expo 57 Router
packages/domain   shared schemas, policies and protected operations
```

The generated dependency on `@messanga11/core` is pinned to the immutable
`core-v0.2.0` release tarball.

## Options

```sh
npx --yes github:Messanga11/create-messanga11-app#v0.1.1 my-app --no-install
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
