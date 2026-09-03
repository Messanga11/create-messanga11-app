import { compileFeatureCatalog } from "@messanga11/core/features";
import { APP_FEATURE_CATALOG } from "@starter/features/catalog";
import { getProductionRuntime } from "./production-runtime";

const CATALOG = compileFeatureCatalog(APP_FEATURE_CATALOG);

export async function readiness(): Promise<Response> {
  if (process.env.NODE_ENV !== "production") {
    return Response.json({ status: "ready", storage: "sqlite" });
  }
  try {
    const runtime = await getProductionRuntime(CATALOG);
    await runtime.ready();
    return Response.json(
      { status: "ready" },
      { headers: { "cache-control": "no-store" } },
    );
  } catch {
    return Response.json(
      { status: "unavailable" },
      { headers: { "cache-control": "no-store" }, status: 503 },
    );
  }
}
