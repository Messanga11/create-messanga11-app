import { watch } from "node:fs";
import { basename, dirname, resolve } from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";
import { generateRoutes, routesConfigPath } from "./generate-routes.mjs";

export function createRegenerationQueue(options) {
  let closed = false;
  let debounceTimer;
  let pending = false;
  let running = false;

  async function run() {
    if (closed || running) {
      pending = !closed;
      return;
    }

    running = true;
    do {
      pending = false;
      try {
        await options.generate();
        options.onGenerated?.();
      } catch (error) {
        options.onError?.(error);
      }
    } while (pending && !closed);
    running = false;
  }

  function schedule() {
    if (closed) return;
    pending = true;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(run, options.debounceMs ?? 80);
  }

  function close() {
    closed = true;
    pending = false;
    clearTimeout(debounceTimer);
  }

  return { close, schedule };
}

export function watchRouteConfig(options = {}) {
  const configPath = options.configPath ?? routesConfigPath;
  const queue = createRegenerationQueue({
    debounceMs: options.debounceMs,
    generate: options.generate ?? generateRoutes,
    onError: options.onError,
    onGenerated: options.onGenerated,
  });
  const watchedFile = basename(configPath);
  const watcher = watch(dirname(configPath), (_event, filename) => {
    if (filename === null || filename.toString() === watchedFile) {
      queue.schedule();
    }
  });

  return {
    close() {
      watcher.close();
      queue.close();
    },
  };
}

export async function startRouteHotReload(options = {}) {
  await (options.generate ?? generateRoutes)();
  return watchRouteConfig(options);
}

function reportError(error) {
  process.stderr.write(
    `Route generation failed; keeping the last valid routes. ${
      error instanceof Error ? error.message : String(error)
    }\n`,
  );
}

const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : "";
if (import.meta.url === invokedPath) {
  const hotReload = await startRouteHotReload({
    onError: reportError,
    onGenerated: () => process.stdout.write("Routes hot-reloaded.\n"),
  });
  process.stdout.write("Watching app.feature.ts for hot reload.\n");
  const stop = () => hotReload.close();
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);
}
