import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const applicationRoot = resolve(root, "template/apps/web/src");
const featuresRoot = resolve(root, "template/packages/features/src");
const intrinsicElement =
  /<(?:article|button|div|h[1-6]|input|main|p|section|select|span|textarea)\b/;

test("Web application code uses controlled design-system primitives", async () => {
  const sourceFiles = [
    ...(await listTypeScriptReactFiles(applicationRoot)),
    ...(await listTypeScriptReactFiles(featuresRoot)),
  ];
  for (const path of sourceFiles) {
    const source = await readFile(path, "utf8");
    assert.doesNotMatch(source, intrinsicElement, path);
  }
});

test("Shared features never import a platform renderer", async () => {
  for (const path of await listTypeScriptReactFiles(featuresRoot)) {
    const source = await readFile(path, "utf8");
    assert.doesNotMatch(
      source,
      /react-native|@starter\/ui-(?:native|web)|\bwindow\b|\bdocument\b/,
      path,
    );
  }
});

test("Generated applications only select their renderer engine", async () => {
  const webEntry = await readFile(resolve(applicationRoot, "app/page.tsx"), "utf8");
  const nativeEntry = await readFile(
    resolve(root, "template/apps/mobile/app/index.tsx"),
    "utf8",
  );

  assert.match(webEntry, /WebFeatureRenderer featureId="profile"/);
  assert.match(nativeEntry, /NativeFeatureRenderer featureId="profile"/);
  assert.match(webEntry, /export const metadata: Metadata/);
  assert.doesNotMatch(`${webEntry}\n${nativeEntry}`, /useState|UiMeta|ProfileFeature/);
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
