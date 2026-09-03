import assert from "node:assert/strict";
import { test } from "node:test";
import { readProductionConfig } from "./production-config";

const valid = {
  DATABASE_URL: "postgresql://app:secret@database.internal/app",
  OIDC_AUTHORIZATION_ENDPOINT: "https://identity.example.com/authorize",
  OIDC_CLIENT_ID: "web-client",
  OIDC_ISSUER: "https://identity.example.com/",
  OIDC_JWKS_URI: "https://identity.example.com/jwks.json",
  OIDC_REDIRECT_URI: "https://app.example.com/api/auth/callback",
  OIDC_TOKEN_ENDPOINT: "https://identity.example.com/token",
  OIDC_TOKEN_ENCRYPTION_KEY: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
  REDIS_URL: "rediss://redis.internal:6379",
} satisfies Readonly<Record<string, string | undefined>>;

test("accepts complete TLS production configuration", () => {
  const config = readProductionConfig(valid);
  assert.equal(config.oidc.clientId, "web-client");
  assert.deepEqual(config.oidc.algorithms, ["RS256"]);
});

test("fails closed when OIDC is missing or Redis is not encrypted", () => {
  assert.throws(() => readProductionConfig({ DATABASE_URL: valid.DATABASE_URL }));
  assert.throws(() =>
    readProductionConfig({ ...valid, REDIS_URL: "redis://redis.internal:6379" }),
  );
});
