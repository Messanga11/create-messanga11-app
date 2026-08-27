# ADR: executable feature catalog

Status: accepted

## Decision

`packages/features/src/app.feature.ts` is the application source of truth. A
feature owns its version, pages, semantic layout tree, block vocabulary, routes,
SEO, access policy, resources and backend operation contracts. The catalog contains JSON-safe
descriptors only and imports no renderer, framework, database or identity provider.

The route generator compiles this TypeScript catalog and emits thin Next.js and
Expo Router entries plus Web SEO artifacts and the generic feature API route. The
Web and Native engines resolve layout identifiers independently. `FeatureRoot`
resolves block identifiers to complete shared feature components.

The server compiles the same catalog. An operation must exist before a handler can
run. The runtime validates HTTP method, authentication/authorization, strict input,
idempotency, rate limit, required audit and strict handler output. Handler names are
resolved through an injected allowlisted registry; a descriptor cannot import or
select a database implementation.

Resource features use `createFeatureCrudOperations`. Core derives strict list,
get, create, update and delete contracts from the declared fields. The compiled
resource index drives the SQLite development allowlist and seed, while the shared
feature component drives Web and Native loading, error, empty, edit and delete
states. A client can never submit a table name or widen the field allowlist.

`createFeatureCrudHandlers` targets the provider-neutral `CrudPort`. Production
composition may replace SQLite with Postgres or another adapter without changing
the feature object. Non-CRUD behavior adds a new named handler to the trusted
server registry; the catalog may reference it only by that allowlisted identifier.

## Extension rules

- New product families such as commerce, food delivery or booking add feature
  objects and renderer blocks; they do not modify the compiler.
- New layouts are new semantic identifiers implemented by both engines.
- New storage, identity, query or telemetry vendors are adapters selected in the
  composition root and never appear in feature definitions.
- New CRUD resources declare fields, optional development seed and semantic page
  metadata once; their routes, contracts and protected backend operations are
  derived without editing the API route.
- Contract changes increment both `schemaVersion` and the feature SemVer when
  compatibility changes.
- Dynamic or tenant-authored feature definitions require a separately sandboxed,
  signed and versioned ingestion boundary; arbitrary runtime code is never loaded.

## Consequences

Generation drift is a CI failure. Unknown blocks, operations, routes, permissions,
methods or schemas fail closed. UI visibility remains advisory; server operations
always enforce the catalog independently of the calling renderer.
