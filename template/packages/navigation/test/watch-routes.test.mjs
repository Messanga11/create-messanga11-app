import assert from "node:assert/strict";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { createRegenerationQueue, watchRouteConfig } from "../scripts/watch-routes.mjs";

test("coalesces rapid route edits into one regeneration", async () => {
  let generations = 0;
  const generated = deferred();
  const queue = createRegenerationQueue({
    debounceMs: 10,
    generate: async () => {
      generations += 1;
    },
    onGenerated: generated.resolve,
  });

  queue.schedule();
  queue.schedule();
  queue.schedule();
  await generated.promise;
  queue.close();

  assert.equal(generations, 1);
});

test("watches atomic config saves and recovers after an invalid edit", async () => {
  const directory = await mkdtemp(join(tmpdir(), "routes-watch-"));
  const configPath = join(directory, "routes.config.json");
  await writeFile(configPath, "{}\n", "utf8");
  let attempts = 0;
  const recovered = deferred();
  const watcher = watchRouteConfig({
    configPath,
    debounceMs: 10,
    generate: async () => {
      attempts += 1;
      if (attempts === 1) throw new Error("temporary invalid JSON");
    },
    onGenerated: recovered.resolve,
  });

  await writeFile(configPath, '{"invalid":true}\n', "utf8");
  await waitFor(() => attempts === 1);
  await writeFile(configPath, "{}\n", "utf8");
  await recovered.promise;
  watcher.close();

  assert.equal(attempts, 2);
});

function deferred() {
  let resolvePromise = () => undefined;
  const promise = new Promise((resolve) => {
    resolvePromise = resolve;
  });
  return { promise, resolve: resolvePromise };
}

async function waitFor(predicate) {
  const deadline = Date.now() + 1_000;
  while (!predicate()) {
    if (Date.now() > deadline) throw new Error("Watcher did not receive the edit.");
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
}
