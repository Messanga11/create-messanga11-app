import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
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
