import type { CrudPort } from "@messanga11/core/crud";
import type { FeatureBackendPorts } from "@messanga11/core/feature-server";
import { compileFeatureCatalog } from "@messanga11/core/features";
import { APP_FEATURE_CATALOG } from "@starter/features/catalog";
import type { FeatureIdentity } from "./feature-backend";

const CATALOG = compileFeatureCatalog(APP_FEATURE_CATALOG);
const MEMORY_LIMITS = new Map<string, { count: number; resetsAt: number }>();

export const runtimeFeatureResources: CrudPort = proxyCrud("features");
export const runtimeCrud: CrudPort = proxyCrud("custom");

export async function resolveRuntimeIdentity(
  request: Request,
): Promise<FeatureIdentity> {
  if (process.env.NODE_ENV !== "production") {
    return {
      actorId: "demo-user",
      permissions: new Set(["application:read", "application:write"]),
      tenantId: "demo-tenant",
    };
  }
  return (await production()).resolveIdentity(request);
}

export async function writeRuntimeAudit(
  event: Parameters<FeatureBackendPorts["audit"]>[0],
): Promise<void> {
  if (process.env.NODE_ENV !== "production") {
    const development = await import("./sqlite-crud");
    return development.writeFeatureAudit(event);
  }
  return (await production()).audit(event);
}

export async function runtimeRateLimit(
  request: Parameters<FeatureBackendPorts["rateLimit"]>[0],
): Promise<{ readonly allowed: boolean; readonly retryAfterMs?: number }> {
  if (process.env.NODE_ENV === "production") {
    return (await production()).rateLimit(request);
  }
  return consumeMemoryLimit(request);
}

function proxyCrud(kind: "custom" | "features"): CrudPort {
  return Object.freeze({
    create: async (request: Parameters<CrudPort["create"]>[0]) =>
      (await activeCrud(kind)).create(request),
    delete: async (request: Parameters<CrudPort["delete"]>[0]) =>
      (await activeCrud(kind)).delete(request),
    get: async (request: Parameters<CrudPort["get"]>[0]) =>
      (await activeCrud(kind)).get(request),
    list: async (request: Parameters<CrudPort["list"]>[0]) =>
      (await activeCrud(kind)).list(request),
    update: async (request: Parameters<CrudPort["update"]>[0]) =>
      (await activeCrud(kind)).update(request),
  });
}

async function activeCrud(kind: "custom" | "features"): Promise<CrudPort> {
  if (process.env.NODE_ENV === "production") return (await production()).crud;
  const development = await import("./sqlite-crud");
  return kind === "custom"
    ? development.sqliteCrud
    : development.sqliteFeatureResources;
}

let productionRuntime:
  | ReturnType<typeof import("./production-runtime")["getProductionRuntime"]>
  | undefined;

function production() {
  productionRuntime ??= import("./production-runtime").then((module) =>
    module.getProductionRuntime(CATALOG),
  );
  return productionRuntime;
}

function consumeMemoryLimit(request: Parameters<FeatureBackendPorts["rateLimit"]>[0]) {
  const key = `${request.context.rateLimitKey ?? "anonymous"}:${request.operation}`;
  const now = Date.now();
  const current = MEMORY_LIMITS.get(key);
  const bucket =
    !current || current.resetsAt <= now
      ? { count: 0, resetsAt: now + request.policy.windowMs }
      : current;
  if (bucket.count + request.policy.cost > request.policy.limit) {
    return { allowed: false, retryAfterMs: Math.max(1, bucket.resetsAt - now) };
  }
  bucket.count += request.policy.cost;
  MEMORY_LIMITS.set(key, bucket);
  return { allowed: true };
}
