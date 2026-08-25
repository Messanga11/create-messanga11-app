import { spawn } from "node:child_process";
import { watch } from "node:fs";
import process from "node:process";
import { generateRoutes, routesConfigPath, workspaceRoot } from "./generate-routes.mjs";

const target = process.argv[2];
const workspaces = { mobile: "@starter/mobile", web: "@starter/web" };
const workspace = workspaces[target];
if (!workspace) {
  throw new Error("Development target must be web or mobile.");
}

await generateRoutes();
const npmExecutable = process.platform === "win32" ? "npm.cmd" : "npm";
const app = spawn(npmExecutable, ["run", "dev", "-w", workspace], {
  cwd: workspaceRoot,
  shell: false,
  stdio: "inherit",
});

let generating = false;
const watcher = watch(routesConfigPath, async () => {
  if (generating) return;
  generating = true;
  try {
    await generateRoutes();
    process.stdout.write("Routes regenerated from routes.config.json.\n");
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  } finally {
    generating = false;
  }
});

function stop(signal) {
  watcher.close();
  app.kill(signal);
}

process.on("SIGINT", () => stop("SIGINT"));
process.on("SIGTERM", () => stop("SIGTERM"));
app.once("exit", (code) => {
  watcher.close();
  process.exitCode = code ?? 1;
});
