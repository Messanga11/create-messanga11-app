import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const applicationRoot = resolve(root, "template/apps/web/src");
const intrinsicElement =
  /<(?:article|button|div|h[1-6]|input|main|p|section|select|span|textarea)\b/;

test("Web application code uses controlled design-system primitives", async () => {
  for (const path of await listTypeScriptReactFiles(applicationRoot)) {
    const source = await readFile(path, "utf8");
    assert.doesNotMatch(source, intrinsicElement, path);
  }
});

async function listTypeScriptReactFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listTypeScriptReactFiles(path)));
    } else if (entry.name.endsWith(".tsx")) {
      files.push(path);
    }
  }
  return files;
}
