import type { JsonValue } from "@messanga11/core";
import type {
  CrudListRequest,
  CrudListResult,
  CrudPort,
  CrudRecord,
  CrudUpdateRequest,
  CrudWriteRequest,
} from "@messanga11/core/crud";

export function createCrudHttpPort(baseUrl = "/api/features"): CrudPort {
  return {
    create: (request) => {
      const operation = parseOperationResource(request.resource);
      return send<CrudRecord>(
        `${baseUrl}/${operation.featureId}/${operation.operationId}`,
        "POST",
        request.values,
        request.idempotencyKey,
      );
    },
    delete: async (request) => {
      await send(
        `${baseUrl}/${encodeURIComponent(request.resource)}/${encodeURIComponent(request.id)}`,
        "DELETE",
      );
    },
    get: (request) =>
      send<CrudRecord | undefined>(
        `${baseUrl}/${encodeURIComponent(request.resource)}/${encodeURIComponent(request.id)}`,
        "GET",
      ),
    list: (request) =>
      send<CrudListResult>(baseUrl, "POST", { operation: "list", ...request }),
    update: (request) => send<CrudRecord>(baseUrl, "PATCH", request),
  };
}

async function send<Result>(
  url: string,
  method: "DELETE" | "GET" | "PATCH" | "POST",
  body?: CrudListRequest | CrudUpdateRequest | CrudWriteRequest | JsonValue,
  idempotencyKey?: string,
): Promise<Result> {
  const response = await fetch(url, {
    method,
    ...(body
      ? {
          body: JSON.stringify(body),
          headers: {
            "content-type": "application/json",
            ...(idempotencyKey ? { "x-idempotency-key": idempotencyKey } : {}),
          },
        }
      : {}),
  });
  if (!response.ok) {
    throw new Error("La sauvegarde a échoué.");
  }
  return (await response.json()) as Result;
}

function parseOperationResource(resource: string): {
  readonly featureId: string;
  readonly operationId: string;
} {
  const [featureId, operationId, extra] = resource.split(".");
  if (!featureId || !operationId || extra) {
    throw new Error("Invalid feature operation resource.");
  }
  return { featureId, operationId };
}
