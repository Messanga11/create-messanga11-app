import { spawn } from "node:child_process";
import process from "node:process";
import { workspaceRoot } from "./generate-routes.mjs";
import { startRouteHotReload } from "./watch-routes.mjs";

const target = process.argv[2];
const workspaces = { mobile: "@starter/mobile", web: "@starter/web" };
const workspace = workspaces[target];
if (!workspace) {
  throw new Error("Development target must be web or mobile.");
}

const hotReload = await startRouteHotReload({
  onError: (error) => {
    process.stderr.write(
      `Route generation failed; keeping the last valid routes. ${
        error instanceof Error ? error.message : String(error)
      }\n`,
    );
  },
  onGenerated: () => process.stdout.write("Routes hot-reloaded.\n"),
});
const npmExecutable = process.platform === "win32" ? "npm.cmd" : "npm";
const app = spawn(npmExecutable, ["run", "dev", "-w", workspace], {
  cwd: workspaceRoot,
  shell: false,
  stdio: "inherit",
});

function stop(signal) {
  hotReload.close();
  app.kill(signal);
}

process.on("SIGINT", () => stop("SIGINT"));
process.on("SIGTERM", () => stop("SIGTERM"));
app.once("exit", (code) => {
  hotReload.close();
  process.exitCode = code ?? 1;
});
