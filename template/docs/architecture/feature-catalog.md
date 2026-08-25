# ADR: executable feature catalog

Status: accepted

## Decision

`packages/features/src/app.feature.ts` is the application source of truth. A
feature owns its version, pages, semantic layout tree, block vocabulary, routes,
SEO, access policy and backend operation contracts. The catalog contains JSON-safe
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

## Extension rules

- New product families such as commerce, food delivery or booking add feature
  objects and renderer blocks; they do not modify the compiler.
- New layouts are new semantic identifiers implemented by both engines.
- New storage, identity, query or telemetry vendors are adapters selected in the
  composition root and never appear in feature definitions.
- Contract changes increment both `schemaVersion` and the feature SemVer when
  compatibility changes.
- Dynamic or tenant-authored feature definitions require a separately sandboxed,
  signed and versioned ingestion boundary; arbitrary runtime code is never loaded.

## Consequences

Generation drift is a CI failure. Unknown blocks, operations, routes, permissions,
methods or schemas fail closed. UI visibility remains advisory; server operations
always enforce the catalog independently of the calling renderer.
