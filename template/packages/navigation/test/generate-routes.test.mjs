import assert from "node:assert/strict";
import { test } from "node:test";
import { generateRoutes, validateRoutesConfig } from "../scripts/generate-routes.mjs";

const validConfig = {
  app: { name: "app", shortName: "app", description: "app", language: "fr" },
  routes: [
    {
      id: "profile",
      featureId: "profile",
      web: { path: "/", title: "app", description: "app", index: true },
      mobile: { path: "/" },
    },
  ],
};

test("accepts an explicit static route registry", () => {
  assert.equal(validateRoutesConfig(validConfig), validConfig);
});

test("rejects traversal and duplicate routes", () => {
  const traversal = structuredClone(validConfig);
  traversal.routes[0].web.path = "/../secret";
  assert.throws(() => validateRoutesConfig(traversal), /unsafe/);

  const duplicate = structuredClone(validConfig);
  duplicate.routes.push(structuredClone(validConfig.routes[0]));
  assert.throws(() => validateRoutesConfig(duplicate), /Duplicate/);
});

test("rejects undeclared configuration fields", () => {
  const unknownField = structuredClone(validConfig);
  unknownField.routes[0].web.keywords = ["invented"];
  assert.throws(() => validateRoutesConfig(unknownField), /unknown fields/);
});

test("writes identical routes safely from concurrent watchers", async () => {
  await Promise.all(Array.from({ length: 10 }, () => generateRoutes()));
  await generateRoutes({ check: true });
});
