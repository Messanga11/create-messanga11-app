# Repository guardrails

- The CLI accepts only allowlisted project names and never overwrites non-empty directories.
- Use `execFile`, never a shell, for user-influenced process execution.
- Keep the template renderer-specific under `apps` and shared business contracts under `packages/domain`.
- Pin `@messanga11/core` to an immutable public GitHub Release URL.
- Run unit tests and the generated-project smoke test before release.
