import { execFile } from "node:child_process";
import { mkdtemp } from "node:fs/promises";
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

for (const argumentsList of [
  ["install"],
  ["run", "typecheck"],
  ["test"],
  ["run", "build:web"],
  ["run", "build:mobile"],
]) {
  const { stdout, stderr } = await execFileAsync("npm", argumentsList, {
    cwd: target,
    maxBuffer: 20 * 1024 * 1024,
  });
  process.stdout.write(stdout);
  process.stderr.write(stderr);
}
