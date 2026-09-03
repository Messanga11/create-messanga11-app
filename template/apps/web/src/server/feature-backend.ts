import type { JsonValue } from "@messanga11/core";
import {
  createFeatureCrudHandlers,
  executeFeatureOperation,
  type FeatureBackendPorts,
  type FeatureOperationHandler,
  type FeatureOperationInvocation,
} from "@messanga11/core/feature-server";
import { compileFeatureCatalog } from "@messanga11/core/features";
import { calculateInvoiceAmounts } from "@starter/domain";
import { APP_FEATURE_CATALOG } from "@starter/features/catalog";
import {
  resolveRuntimeIdentity,
  runtimeCrud,
  runtimeFeatureResources,
  runtimeRateLimit,
  writeRuntimeAudit,
} from "./runtime-storage";

const MAX_BODY_BYTES = 1_000_000;
const CATALOG = compileFeatureCatalog(APP_FEATURE_CATALOG);

const BASE_PORTS: FeatureBackendPorts = {
  audit: writeRuntimeAudit,
  authorize: async ({ context, operation }) =>
    operation.access.mode === "authenticated" &&
    operation.access.permissions.every((permission) =>
      context.permissions.has(permission),
    ),
  handlers: {
    ...createFeatureCrudHandlers(runtimeFeatureResources),
    "form-builder.submit": submitForm,
    "invoice.create": createInvoice,
  },
  rateLimit: runtimeRateLimit,
};

export interface FeatureBackendExtension {
  readonly handlers?: Readonly<Record<string, FeatureOperationHandler>>;
  readonly identity?: (request: Request) => FeatureIdentity | Promise<FeatureIdentity>;
  readonly ports?: Partial<
    Pick<FeatureBackendPorts, "audit" | "authorize" | "rateLimit" | "reportError">
  >;
}

export interface FeatureIdentity {
  readonly actorId?: string;
  readonly permissions: ReadonlySet<string>;
  readonly tenantId?: string;
}

// MICROCONTEXT[feature-backend-extension]: Production composition injects identity, policy, telemetry and custom handlers here.
export function createFeatureRequestHandler(extension: FeatureBackendExtension = {}) {
  const ports: FeatureBackendPorts = {
    ...BASE_PORTS,
    ...extension.ports,
    handlers: mergeHandlers(BASE_PORTS.handlers, extension.handlers ?? {}),
  };
  const identity = extension.identity ?? resolveRuntimeIdentity;
  return async (
    request: Request,
    params: { readonly featureId: string; readonly operationId: string },
  ): Promise<Response> => executeRequest(request, params, ports, identity);
}

const DEFAULT_REQUEST_HANDLER = createFeatureRequestHandler();

export async function handleFeatureRequest(
  request: Request,
  params: { readonly featureId: string; readonly operationId: string },
): Promise<Response> {
  return DEFAULT_REQUEST_HANDLER(request, params);
}

async function executeRequest(
  request: Request,
  params: { readonly featureId: string; readonly operationId: string },
  ports: FeatureBackendPorts,
  identity: (request: Request) => FeatureIdentity | Promise<FeatureIdentity>,
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
      ...(await identity(request)),
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
    ports,
  });
  if (result.status === "success") return Response.json(result.data, { status: 200 });
  return Response.json(
    { code: result.code, requestId: result.requestId },
    {
      ...(result.retryAfterMs
        ? {
            headers: {
              "retry-after": String(Math.ceil(result.retryAfterMs / 1_000)),
            },
          }
        : {}),
      status: statusFor(result.code),
    },
  );
}

function mergeHandlers(
  builtIn: Readonly<Record<string, FeatureOperationHandler>>,
  extensions: Readonly<Record<string, FeatureOperationHandler>>,
): Readonly<Record<string, FeatureOperationHandler>> {
  for (const id of Object.keys(extensions)) {
    if (builtIn[id]) throw new TypeError(`Feature handler already registered: ${id}`);
  }
  return Object.freeze({ ...builtIn, ...extensions });
}

async function submitForm(invocation: FeatureOperationInvocation) {
  const idempotencyKey = invocation.idempotencyKey;
  if (!idempotencyKey) throw new Error("Missing idempotency key.");
  const existing = await findSubmission(idempotencyKey, invocation.context.tenantId);
  if (existing) return pickSubmissionResult(existing);
  const createdAt = new Date().toISOString();
  try {
    const record = await runtimeCrud.create({
      idempotencyKey,
      resource: "form_submissions",
      ...(invocation.context.tenantId ? { tenantId: invocation.context.tenantId } : {}),
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
    const raced = await findSubmission(idempotencyKey, invocation.context.tenantId);
    if (raced) return pickSubmissionResult(raced);
    throw caught;
  }
}

async function createInvoice(invocation: FeatureOperationInvocation) {
  const idempotencyKey = invocation.idempotencyKey;
  if (!idempotencyKey) throw new Error("Missing idempotency key.");
  const existing = await findByIdempotencyKey(
    "invoices",
    idempotencyKey,
    invocation.context.tenantId,
  );
  if (existing) return pickInvoiceResult(existing);
  const input = readInvoiceInput(invocation.input);
  const amounts = calculateInvoiceAmounts(input);
  if (!amounts) throw new Error("Invalid invoice amounts.");
  const createdAt = new Date().toISOString();
  const invoiceNumber = `FAC-${createdAt.slice(0, 10).replaceAll("-", "")}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  try {
    const record = await runtimeCrud.create({
      idempotencyKey,
      resource: "invoices",
      ...(invocation.context.tenantId ? { tenantId: invocation.context.tenantId } : {}),
      values: {
        createdAt,
        idempotencyKey,
        invoiceNumber,
        payload: invocation.input,
        total: amounts.total,
      },
    });
    return pickInvoiceResult(record);
  } catch (caught) {
    const raced = await findByIdempotencyKey(
      "invoices",
      idempotencyKey,
      invocation.context.tenantId,
    );
    if (raced) return pickInvoiceResult(raced);
    throw caught;
  }
}

async function findSubmission(idempotencyKey: string, tenantId?: string) {
  return findByIdempotencyKey("form_submissions", idempotencyKey, tenantId);
}

async function findByIdempotencyKey(
  resource: string,
  idempotencyKey: string,
  tenantId?: string,
) {
  const result = await runtimeCrud.list({
    filters: [{ field: "idempotencyKey", operator: "eq", value: idempotencyKey }],
    limit: 1,
    offset: 0,
    resource,
    ...(tenantId ? { tenantId } : {}),
  });
  return result.records[0];
}

function pickSubmissionResult(record: Readonly<Record<string, JsonValue>>): JsonValue {
  return { createdAt: record.createdAt ?? "", id: record.id ?? "" };
}

function pickInvoiceResult(record: Readonly<Record<string, JsonValue>>): JsonValue {
  return {
    createdAt: record.createdAt ?? "",
    id: record.id ?? "",
    invoiceNumber: record.invoiceNumber ?? "",
    total: record.total ?? 0,
  };
}

function readInvoiceInput(input: JsonValue) {
  if (!isJsonObject(input)) throw new Error("Invalid invoice input.");
  return {
    quantity: readNumber(input.quantity),
    taxRate: readNumber(input.taxRate),
    unitPrice: readNumber(input.unitPrice),
  };
}

function isJsonObject(value: JsonValue): value is Readonly<Record<string, JsonValue>> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function readNumber(value: JsonValue | undefined): number {
  if (typeof value !== "number") throw new Error("Invalid invoice number.");
  return value;
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
