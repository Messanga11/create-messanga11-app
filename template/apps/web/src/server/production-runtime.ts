import {
  createPostgresFeatureResourceAdapter,
  createPostgresOidcTenantAccess,
  createPostgresOidcTokenVault,
  createPostgresOutbox,
  createPostgresSessionStore,
  type PostgresFeatureFieldStorage,
  type SqlClientPort,
  type SqlPoolPort,
} from "@messanga11/adapter-postgres";
import {
  createNodeRedisFunctionTransport,
  createRedisOidcLoginTransactionStore,
  createRedisRateLimitPort,
  REDIS_FUNCTION_LIBRARY,
} from "@messanga11/adapter-redis";
import { digestSessionToken } from "@messanga11/auth-oidc/server";
import type { CrudPort } from "@messanga11/core/crud";
import type { FeatureBackendPorts } from "@messanga11/core/feature-server";
import type { CompiledFeatureCatalog } from "@messanga11/core/features";
import {
  OperationNameSchema,
  parseAuthenticatedRequestContext,
} from "@messanga11/core/server";
import { Pool } from "pg";
import type { FeatureIdentity } from "./feature-backend";
import { readProductionConfig } from "./production-config";

const SESSION_COOKIE = "m11_session";
const TENANT_COOKIE = "m11_tenant";
const ROLE_PERMISSIONS = Object.freeze({
  admin: ["application:read", "application:write"],
  member: ["application:read", "application:write"],
  owner: ["application:read", "application:write"],
  viewer: ["application:read"],
});

export interface ProductionRuntime {
  readonly audit: FeatureBackendPorts["audit"];
  readonly crud: CrudPort;
  readonly oidc: {
    readonly config: ReturnType<typeof readProductionConfig>["oidc"];
    readonly sessions: ReturnType<typeof createPostgresSessionStore>;
    readonly tenantAccess: ReturnType<typeof createPostgresOidcTenantAccess>;
    readonly tokenVault: ReturnType<typeof createPostgresOidcTokenVault>;
    readonly transactions: ReturnType<typeof createRedisOidcLoginTransactionStore>;
    readonly logout: (request: Request) => Promise<void>;
  };
  readonly outbox: ReturnType<typeof createPostgresOutbox>;
  readonly rateLimit: FeatureBackendPorts["rateLimit"];
  readonly ready: () => Promise<void>;
  readonly resolveIdentity: (request: Request) => Promise<FeatureIdentity>;
}

export async function getProductionRuntime(
  catalog: CompiledFeatureCatalog,
): Promise<ProductionRuntime> {
  productionRuntime ??= createProductionRuntime(catalog);
  return productionRuntime;
}

let productionRuntime: Promise<ProductionRuntime> | undefined;

async function createProductionRuntime(
  catalog: CompiledFeatureCatalog,
): Promise<ProductionRuntime> {
  const config = readProductionConfig();
  const pool = new Pool({
    connectionString: config.databaseUrl,
    max: 10,
    statement_timeout: 10_000,
  }) as unknown as SqlPoolPort;
  const redis = createNodeRedisFunctionTransport({ url: config.redisUrl });
  await redis.load(REDIS_FUNCTION_LIBRARY);
  const sessions = createPostgresSessionStore(pool);
  const tokenVault = createPostgresOidcTokenVault({
    encryptionKey: config.oidcTokenEncryptionKey,
    pool,
  });
  return Object.freeze({
    audit: createAuditWriter(pool),
    crud: createPostgresFeatureResourceAdapter({
      pool,
      resources: toPostgresResources(catalog),
    }),
    oidc: Object.freeze({
      config: config.oidc,
      sessions,
      tenantAccess: createPostgresOidcTenantAccess(pool),
      tokenVault,
      transactions: createRedisOidcLoginTransactionStore(redis),
      logout: (request: Request) => logout(request, sessions, tokenVault),
    }),
    outbox: createPostgresOutbox(pool),
    rateLimit: createRateLimiter(redis),
    ready: () => verifyDatabase(pool),
    resolveIdentity: (request: Request) => resolveIdentity(request, pool, sessions),
  });
}

async function verifyDatabase(pool: SqlPoolPort): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("SELECT 1");
    const result = await client.query<{ count: unknown }>(
      "SELECT count(*)::text AS count FROM messanga_migrations",
    );
    if (Number(result.rows[0]?.count ?? 0) < 5) {
      throw new Error("Database migrations are incomplete.");
    }
  } finally {
    client.release?.();
  }
}

async function logout(
  request: Request,
  sessions: ReturnType<typeof createPostgresSessionStore>,
  tokenVault: ReturnType<typeof createPostgresOidcTokenVault>,
): Promise<void> {
  const cookies = parseCookies(request.headers.get("cookie"));
  const tenantId = cookies.get(TENANT_COOKIE);
  const token = cookies.get(SESSION_COOKIE);
  if (!tenantId || !token) return;
  const session = await sessions.resolve({
    tenantId,
    tokenDigest: digestSessionToken(token),
  });
  if (!session) return;
  await sessions.revoke({ sessionId: session.sessionId, tenantId });
  await tokenVault.revoke({ sessionId: session.sessionId, tenantId });
}

function toPostgresResources(catalog: CompiledFeatureCatalog) {
  return {
    ...Object.fromEntries(
      Object.entries(catalog.resources).map(([id, resource]) => [
        id,
        {
          fields: Object.fromEntries(
            Object.entries(resource.fields).map(([field, definition]) => [
              field,
              toStorage(definition.schema.type),
            ]),
          ),
        },
      ]),
    ),
    form_submissions: {
      fields: {
        createdAt: "text",
        formId: "text",
        id: "text",
        idempotencyKey: "text",
        payload: "text",
        status: "text",
      },
    },
    invoices: {
      fields: {
        createdAt: "text",
        id: "text",
        idempotencyKey: "text",
        invoiceNumber: "text",
        payload: "text",
        total: "number",
      },
    },
  } as const;
}

function toStorage(type: string): PostgresFeatureFieldStorage {
  if (type === "boolean") return "boolean";
  if (type === "decimal" || type === "integer" || type === "number") return "number";
  return "text";
}

function createRateLimiter(
  transport: Parameters<typeof createRedisRateLimitPort>[0]["transport"],
): FeatureBackendPorts["rateLimit"] {
  const ports = new Map<string, ReturnType<typeof createRedisRateLimitPort>>();
  return async ({ context, operation, policy }) => {
    const cacheKey = `${policy.cost}:${policy.limit}:${policy.windowMs}`;
    let port = ports.get(cacheKey);
    if (!port) {
      port = createRedisRateLimitPort({
        cost: policy.cost,
        limit: policy.limit,
        namespace: "messanga11",
        transport,
        windowMs: policy.windowMs,
      });
      ports.set(cacheKey, port);
    }
    return port.consume({
      context: parseAuthenticatedRequestContext({
        actor: { id: context.actorId ?? "anonymous", type: "human" },
        requestId: context.requestId,
        tenantId: context.tenantId ?? "public",
      }),
      operation: OperationNameSchema.parse(operation),
    });
  };
}

function createAuditWriter(pool: SqlPoolPort): FeatureBackendPorts["audit"] {
  return async (event) => {
    if (!event.tenantId) throw new Error("Tenant audit context is required.");
    await withTenant(pool, event.tenantId, async (client) => {
      await client.query(
        "INSERT INTO audit_events (tenant_id, event_id, occurred_at, body) VALUES ($1, $2, clock_timestamp(), $3::jsonb)",
        [event.tenantId, crypto.randomUUID(), event],
      );
    });
  };
}

async function resolveIdentity(
  request: Request,
  pool: SqlPoolPort,
  sessions: ReturnType<typeof createPostgresSessionStore>,
): Promise<FeatureIdentity> {
  const cookies = parseCookies(request.headers.get("cookie"));
  const tenantId = cookies.get(TENANT_COOKIE);
  const token = cookies.get(SESSION_COOKIE);
  if (!tenantId || !token) return { permissions: new Set() };
  const session = await sessions.resolve({
    tenantId,
    tokenDigest: digestSessionToken(token),
  });
  if (!session) return { permissions: new Set() };
  const role = await readRole(pool, tenantId, session.identity.id);
  if (!role) return { permissions: new Set() };
  return Object.freeze({
    actorId: session.identity.id,
    permissions: new Set(ROLE_PERMISSIONS[role]),
    tenantId,
  });
}

async function readRole(
  pool: SqlPoolPort,
  tenantId: string,
  identityId: string,
): Promise<keyof typeof ROLE_PERMISSIONS | undefined> {
  return withTenant(pool, tenantId, async (client) => {
    const result = await client.query<{ role: unknown }>(
      "SELECT role FROM memberships WHERE tenant_id = $1 AND identity_id = $2 AND status = 'active'",
      [tenantId, identityId],
    );
    const role = result.rows[0]?.role;
    return typeof role === "string" && role in ROLE_PERMISSIONS
      ? (role as keyof typeof ROLE_PERMISSIONS)
      : undefined;
  });
}

function parseCookies(header: string | null): ReadonlyMap<string, string> {
  const values = new Map<string, string>();
  for (const part of header?.split(";") ?? []) {
    const separator = part.indexOf("=");
    if (separator < 1) continue;
    const name = part.slice(0, separator).trim();
    const value = part.slice(separator + 1).trim();
    if (/^[A-Za-z0-9_-]{1,128}$/.test(name) && value.length <= 4_096) {
      values.set(name, value);
    }
  }
  return values;
}

async function withTenant<Result>(
  pool: SqlPoolPort,
  tenantId: string,
  work: (client: SqlClientPort) => Promise<Result>,
): Promise<Result> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT set_config('app.tenant_id', $1, true)", [tenantId]);
    const result = await work(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    client.release?.();
  }
}

export const AUTH_COOKIE_NAMES = Object.freeze({
  session: SESSION_COOKIE,
  tenant: TENANT_COOKIE,
});
