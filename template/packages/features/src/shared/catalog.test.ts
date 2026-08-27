import assert from "node:assert/strict";
import { test } from "node:test";
import { compileFeatureCatalog } from "@messanga11/core/features";
import { APP_FEATURE_CATALOG } from "../app.feature.ts";

test("declares the complete Refine admin surface in one catalog", () => {
  const catalog = compileFeatureCatalog(APP_FEATURE_CATALOG);
  for (const featureId of [
    "categories",
    "couriers",
    "customers",
    "dashboard",
    "orders",
    "products",
    "stores",
  ]) {
    assert.ok(catalog.pages[`${featureId}.index`]);
    if (featureId !== "dashboard") {
      assert.ok(catalog.resources[`${featureId}.${featureId}`]);
      for (const operation of ["create", "delete", "get", "list", "update"]) {
        assert.ok(catalog.operations[`${featureId}.${operation}`]);
      }
    }
  }
});

test("keeps dashboard and resource components declarative", () => {
  const catalog = compileFeatureCatalog(APP_FEATURE_CATALOG);
  const dashboard = catalog.pages["dashboard.index"]?.root;
  const products = catalog.pages["products.index"]?.root;
  assert.equal(dashboard?.kind, "layout");
  assert.equal(products?.kind, "layout");
  if (dashboard?.kind !== "layout" || products?.kind !== "layout") return;
  assert.equal(dashboard.children[0]?.kind, "block");
  assert.equal(products.children[0]?.kind, "block");
  assert.equal(dashboard.children[0]?.block, "dashboard.screen");
  assert.equal(products.children[0]?.block, "resource.list");
  assert.equal(products.children[0]?.query, "list");
  assert.deepEqual(products.children[0]?.actions, {
    create: "create",
    delete: "delete",
    update: "update",
  });
});
