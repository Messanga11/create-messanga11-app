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
    projectName: "my-app",
  });
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
    projectName: "sample-app",
  });

  const rootManifest = JSON.parse(await readFile(join(target, "package.json"), "utf8"));
  const domainManifest = JSON.parse(
    await readFile(join(target, "packages/domain/package.json"), "utf8"),
  );
  const mobileConfig = await readFile(join(target, "apps/mobile/app.json"), "utf8");

  assert.equal(rootManifest.name, "sample-app");
  assert.match(domainManifest.dependencies["@messanga11/core"], /core-v0\.2\.0/);
  assert.match(mobileConfig, /com\.messanga11\.appsampleapp/);
  await readFile(join(target, "apps/web/src/app/page.tsx"), "utf8");
  await readFile(join(target, "apps/mobile/app/index.tsx"), "utf8");
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
