import type {
  CrudListRequest,
  CrudListResult,
  CrudPort,
  CrudRecord,
  CrudUpdateRequest,
  CrudWriteRequest,
} from "@messanga11/core/crud";

export function createCrudHttpPort(baseUrl = "/api/crud"): CrudPort {
  return {
    create: (request) => send<CrudRecord>(baseUrl, "POST", request),
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
  body?: CrudListRequest | CrudUpdateRequest | CrudWriteRequest | object,
): Promise<Result> {
  const response = await fetch(url, {
    method,
    ...(body
      ? {
          body: JSON.stringify(body),
          headers: { "content-type": "application/json" },
        }
      : {}),
  });
  if (!response.ok) {
    throw new Error("La sauvegarde a échoué.");
  }
  return (await response.json()) as Result;
}
