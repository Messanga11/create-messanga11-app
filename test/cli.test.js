import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { parseArguments } from "../src/cli.js";
import { scaffoldProject } from "../src/scaffold.js";

test("parses a project name and no-install option", () => {
  assert.deepEqual(parseArguments(["my-app", "--no-install"]), {
    help: false,
    install: false,
    preset: "admin",
    projectName: "my-app",
  });
});

test("parses an allowlisted capability preset", () => {
  assert.equal(parseArguments(["my-app", "--preset", "commerce"]).preset, "commerce");
  assert.equal(parseArguments(["my-app", "--preset=delivery"]).preset, "delivery");
  assert.throws(
    () => parseArguments(["my-app", "--preset", "unknown"]),
    /Unknown preset/,
  );
});

test("rejects paths and shell syntax as project names", () => {
  for (const name of ["../escape", "MyApp", "app;echo", "app_name"]) {
    assert.throws(() => parseArguments([name]), /Project names/);
  }
});

test("scaffolds both applications and pins core", async () => {
  const cwd = await mkdtemp(join(tmpdir(), "messanga11-cli-test-"));
  const target = await scaffoldProject({
    cwd,
    install: false,
    preset: "commerce",
    projectName: "sample-app",
  });

  const rootManifest = JSON.parse(await readFile(join(target, "package.json"), "utf8"));
  const domainManifest = JSON.parse(
    await readFile(join(target, "packages/domain/package.json"), "utf8"),
  );
  const mobileConfig = await readFile(join(target, "apps/mobile/app.json"), "utf8");
  const agents = await readFile(join(target, "AGENTS.md"), "utf8");
  const design = await readFile(join(target, "DESIGN.md"), "utf8");
  const designManifest = JSON.parse(
    await readFile(join(target, "packages/design-system/package.json"), "utf8"),
  );
  const webUiManifest = JSON.parse(
    await readFile(join(target, "packages/ui-web/package.json"), "utf8"),
  );
  const nativeUiManifest = JSON.parse(
    await readFile(join(target, "packages/ui-native/package.json"), "utf8"),
  );
  const featuresManifest = JSON.parse(
    await readFile(join(target, "packages/features/package.json"), "utf8"),
  );
  const navigationManifest = JSON.parse(
    await readFile(join(target, "packages/navigation/package.json"), "utf8"),
  );
  const catalog = await readFile(
    join(target, "packages/features/src/app.feature.ts"),
    "utf8",
  );
  const preset = await readFile(
    join(target, "packages/features/src/preset.ts"),
    "utf8",
  );

  assert.equal(rootManifest.name, "sample-app");
  assert.equal(designManifest.name, "@starter/design-system");
  assert.equal(webUiManifest.name, "@starter/ui-web");
  assert.equal(nativeUiManifest.name, "@starter/ui-native");
  assert.equal(featuresManifest.name, "@starter/features");
  assert.equal(navigationManifest.name, "@starter/navigation");
  assert.match(catalog, /name: "sample-app"/);
  assert.match(catalog, /FORM_BUILDER_FEATURE/);
  assert.match(preset, /commerce/);
  assert.match(domainManifest.dependencies["@messanga11/core"], /core-v0\.5\.0/);
  assert.match(mobileConfig, /com\.messanga11\.appsampleapp/);
  assert.match(agents, /Read `DESIGN\.md`/);
  assert.match(design, /npm run design:sync/);
  assert.match(design, /@messanga11\/core\/design/);
  await readFile(join(target, "apps/web/src/app/page.tsx"), "utf8");
  await readFile(join(target, "apps/web/src/app/formulaire/page.tsx"), "utf8");
  await readFile(join(target, "apps/web/src/app/factures/page.tsx"), "utf8");
  await readFile(join(target, "apps/web/src/app/products/page.tsx"), "utf8");
  await readFile(join(target, "apps/mobile/app/index.tsx"), "utf8");
  await readFile(join(target, "apps/mobile/app/formulaire.tsx"), "utf8");
  await readFile(join(target, "apps/mobile/app/factures.tsx"), "utf8");
  await readFile(join(target, "apps/mobile/app/products.tsx"), "utf8");
  await readFile(join(target, "apps/web/src/app/robots.ts"), "utf8");
  await readFile(join(target, "apps/web/src/app/sitemap.ts"), "utf8");
  await readFile(join(target, "apps/web/src/app/manifest.ts"), "utf8");
});

test("refuses to overwrite a non-empty directory", async () => {
  const cwd = await mkdtemp(join(tmpdir(), "messanga11-cli-test-"));
  const target = join(cwd, "existing-app");
  await mkdir(target);
  await writeFile(join(target, "keep.txt"), "keep", "utf8");

  await assert.rejects(
    scaffoldProject({ cwd, install: false, projectName: "existing-app" }),
    /not empty/,
  );
  assert.equal(await readFile(join(target, "keep.txt"), "utf8"), "keep");
});
