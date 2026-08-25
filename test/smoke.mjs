import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { access, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { scaffoldProject } from "../src/scaffold.js";

const execFileAsync = promisify(execFile);
const cwd = await mkdtemp(join(tmpdir(), "messanga11-smoke-"));
const target = await scaffoldProject({
  cwd,
  install: false,
  projectName: "smoke-app",
});

await runNpm(["install"]);

const designRoot = join(target, "packages/design-system");
const designConfig = join(designRoot, "design.config.json");
await writeFile(
  designConfig,
  `${JSON.stringify({ color: { accent: "#315d55" }, spacing: { md: 28 } })}\n`,
  "utf8",
);
await runNpm(["run", "design:sync"]);
const configuredCss = await readFile(join(designRoot, "web.css"), "utf8");
assert.match(configuredCss, /--ds-color-accent: #315d55;/);
assert.match(configuredCss, /--ds-spacing-md: 28px;/);
await writeFile(designConfig, "{}\n", "utf8");
await runNpm(["run", "design:sync"]);

await runNpm(["run", "routes:check"]);
const routesPath = join(target, "packages/features/routes.config.json");
const originalRoutes = JSON.parse(await readFile(routesPath, "utf8"));
const nestedRoutes = structuredClone(originalRoutes);
nestedRoutes.routes[0].web.path = "/account/profile";
nestedRoutes.routes[0].mobile.path = "/account/profile";
await writeFile(routesPath, `${JSON.stringify(nestedRoutes, null, 2)}\n`, "utf8");
await runNpm(["run", "routes:generate"]);
await access(join(target, "apps/web/src/app/account/profile/page.tsx"));
await access(join(target, "apps/mobile/app/account/profile.tsx"));
await assert.rejects(access(join(target, "apps/web/src/app/page.tsx")));
await writeFile(routesPath, `${JSON.stringify(originalRoutes, null, 2)}\n`, "utf8");
await runNpm(["run", "routes:generate"]);
await access(join(target, "apps/web/src/app/page.tsx"));
await assert.rejects(access(join(target, "apps/web/src/app/account/profile/page.tsx")));

for (const argumentsList of [
  ["run", "typecheck"],
  ["test"],
  ["run", "build:web"],
  ["run", "build:mobile"],
]) {
  await runNpm(argumentsList);
}

async function runNpm(argumentsList) {
  const { stdout, stderr } = await execFileAsync("npm", argumentsList, {
    cwd: target,
    maxBuffer: 20 * 1024 * 1024,
  });
  process.stdout.write(stdout);
  process.stderr.write(stderr);
}
