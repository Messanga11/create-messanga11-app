import assert from "node:assert/strict";
import { test } from "node:test";
import { generateRoutes } from "../scripts/generate-routes.mjs";

test("generates pages, SEO and the backend route from the feature catalog", async () => {
  const files = await generateRoutes();
  assert.match(files.get("apps/web/src/app/formulaire/page.tsx"), /pageId="index"/);
  assert.match(
    files.get("apps/web/src/app/formulaire/page.tsx"),
    /FormBuilder complexe/,
  );
  assert.ok(files.has("apps/mobile/app/formulaire.tsx"));
  assert.match(
    files.get("apps/web/src/app/factures/page.tsx"),
    /Mini générateur de facture/,
  );
  assert.ok(files.has("apps/mobile/app/factures.tsx"));
  for (const route of [
    "categories",
    "couriers",
    "customers",
    "orders",
    "products",
    "stores",
  ]) {
    assert.ok(files.has(`apps/web/src/app/${route}/page.tsx`));
    assert.ok(files.has(`apps/mobile/app/${route}.tsx`));
  }
  assert.ok(
    files.has("apps/web/src/app/api/features/[featureId]/[operationId]/route.ts"),
  );
  const apiRoute = files.get(
    "apps/web/src/app/api/features/[featureId]/[operationId]/route.ts",
  );
  assert.match(apiRoute, /dispatch as DELETE/);
  assert.match(apiRoute, /dispatch as PATCH/);
});

test("writes identical routes safely from concurrent watchers", async () => {
  await Promise.all(Array.from({ length: 10 }, () => generateRoutes()));
  await generateRoutes({ check: true });
});
