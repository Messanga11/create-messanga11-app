import type { JsonValue } from "@messanga11/core";
import {
  executeFeatureOperation,
  type FeatureBackendPorts,
  type FeatureOperationInvocation,
} from "@messanga11/core/feature-server";
import { compileFeatureCatalog } from "@messanga11/core/features";
import { APP_FEATURE_CATALOG } from "@starter/features/catalog";
import { sqliteCrud, writeFeatureAudit } from "./sqlite-crud";

const MAX_BODY_BYTES = 1_000_000;
const CATALOG = compileFeatureCatalog(APP_FEATURE_CATALOG);
const RATE_LIMITS = new Map<string, { count: number; resetsAt: number }>();

const PORTS: FeatureBackendPorts = {
  audit: async (event) => writeFeatureAudit(event),
  authorize: async ({ context, operation }) =>
    operation.access.mode === "authenticated" &&
    operation.access.permissions.every((permission) =>
      context.permissions.has(permission),
    ),
  handlers: { "form-builder.submit": submitForm },
  rateLimit: async ({ context, operation, policy }) =>
    consumeRateLimit(`${context.rateLimitKey ?? "anonymous"}:${operation}`, policy),
};

export async function handleFeatureRequest(
  request: Request,
  params: { readonly featureId: string; readonly operationId: string },
): Promise<Response> {
  if (!request.headers.get("content-type")?.startsWith("application/json")) {
    return Response.json({ code: "INVALID_INPUT" }, { status: 415 });
  }
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (!Number.isSafeInteger(contentLength) || contentLength > MAX_BODY_BYTES) {
    return Response.json({ code: "INVALID_INPUT" }, { status: 413 });
  }
  const input = await request.json().catch(() => undefined);
  const requestId = crypto.randomUUID();
  const result = await executeFeatureOperation({
    catalog: CATALOG,
    context: {
      permissions: new Set<string>(),
      rateLimitKey: readClientKey(request),
      requestId,
    },
    featureId: params.featureId,
    ...(request.headers.get("x-idempotency-key")
      ? { idempotencyKey: request.headers.get("x-idempotency-key") as string }
      : {}),
    input,
    method: request.method,
    operationId: params.operationId,
    ports: PORTS,
  });
  if (result.status === "success") return Response.json(result.data, { status: 200 });
  return Response.json(
    { code: result.code, requestId: result.requestId },
    {
      ...(result.retryAfterMs
        ? { headers: { "retry-after": String(Math.ceil(result.retryAfterMs / 1_000)) } }
        : {}),
      status: statusFor(result.code),
    },
  );
}

async function submitForm(invocation: FeatureOperationInvocation) {
  const idempotencyKey = invocation.idempotencyKey;
  if (!idempotencyKey) throw new Error("Missing idempotency key.");
  const existing = await findSubmission(idempotencyKey);
  if (existing) return pickSubmissionResult(existing);
  const createdAt = new Date().toISOString();
  try {
    const record = await sqliteCrud.create({
      idempotencyKey,
      resource: "form_submissions",
      values: {
        createdAt,
        formId: "form-builder",
        idempotencyKey,
        payload: invocation.input,
        status: "submitted",
      },
    });
    return pickSubmissionResult(record);
  } catch (caught) {
    const raced = await findSubmission(idempotencyKey);
    if (raced) return pickSubmissionResult(raced);
    throw caught;
  }
}

async function findSubmission(idempotencyKey: string) {
  const result = await sqliteCrud.list({
    filters: [{ field: "idempotencyKey", operator: "eq", value: idempotencyKey }],
    limit: 1,
    offset: 0,
    resource: "form_submissions",
  });
  return result.records[0];
}

function pickSubmissionResult(record: Readonly<Record<string, JsonValue>>): JsonValue {
  return { createdAt: record.createdAt ?? "", id: record.id ?? "" };
}

function consumeRateLimit(
  key: string,
  policy: { readonly cost: number; readonly limit: number; readonly windowMs: number },
) {
  const now = Date.now();
  const current = RATE_LIMITS.get(key);
  const bucket =
    !current || current.resetsAt <= now
      ? { count: 0, resetsAt: now + policy.windowMs }
      : current;
  if (bucket.count + policy.cost > policy.limit) {
    return { allowed: false, retryAfterMs: Math.max(1, bucket.resetsAt - now) };
  }
  bucket.count += policy.cost;
  RATE_LIMITS.set(key, bucket);
  return { allowed: true };
}

function readClientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded && /^[0-9a-f:.]{2,64}$/i.test(forwarded) ? forwarded : "anonymous";
}

function statusFor(code: string): number {
  if (code === "NOT_FOUND") return 404;
  if (code === "METHOD_NOT_ALLOWED") return 405;
  if (code === "UNAUTHENTICATED") return 401;
  if (code === "FORBIDDEN") return 403;
  if (code === "RATE_LIMITED") return 429;
  if (code === "INTERNAL") return 500;
  return 400;
}
