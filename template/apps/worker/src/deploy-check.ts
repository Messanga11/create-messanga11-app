import {
  createNodeRedisFunctionTransport,
  REDIS_FUNCTION_LIBRARY,
} from "@messanga11/adapter-redis";
import { Pool } from "pg";
import { z } from "zod";

const ConfigSchema = z.object({
  DATABASE_MIGRATION_URL: z.string().min(1),
  DATABASE_URL: z.string().min(1),
  OIDC_AUTHORIZATION_ENDPOINT: z.url(),
  OIDC_CLIENT_ID: z.string().min(1),
  OIDC_ISSUER: z.url(),
  OIDC_JWKS_URI: z.url(),
  OIDC_REDIRECT_URI: z.url(),
  OIDC_TOKEN_ENCRYPTION_KEY: z.string().length(44),
  OIDC_TOKEN_ENDPOINT: z.url(),
  REDIS_URL: z.string().refine((value) => new URL(value).protocol === "rediss:"),
});
const config = ConfigSchema.parse(process.env);
if (config.DATABASE_URL === config.DATABASE_MIGRATION_URL) {
  throw new Error("Application and migration database roles must be separate.");
}

const pool = new Pool({ connectionString: config.DATABASE_URL, max: 1 });
const redis = createNodeRedisFunctionTransport({ url: config.REDIS_URL });
try {
  const role = await pool.query<{ rolbypassrls: boolean; rolsuper: boolean }>(
    "SELECT rolbypassrls, rolsuper FROM pg_roles WHERE rolname = current_user",
  );
  if (role.rows[0]?.rolbypassrls || role.rows[0]?.rolsuper) {
    throw new Error("Application database role bypasses tenant isolation.");
  }
  const tables = await pool.query<{ count: string }>(
    "SELECT count(*)::text AS count FROM pg_class WHERE relname = ANY($1::text[]) AND relrowsecurity AND relforcerowsecurity",
    [
      [
        "audit_events",
        "memberships",
        "messanga11_feature_records",
        "outbox",
        "sessions",
      ],
    ],
  );
  if (Number(tables.rows[0]?.count ?? 0) !== 5) {
    throw new Error("Required RLS policies are not active.");
  }
  await redis.load(REDIS_FUNCTION_LIBRARY);
} finally {
  await Promise.allSettled([pool.end(), redis.close()]);
}
