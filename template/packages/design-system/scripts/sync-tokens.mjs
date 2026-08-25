import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { createDesignSystem } from "@messanga11/core/design";
import designOverrides from "../design.config.json" with { type: "json" };

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const tokens = createDesignSystem(designOverrides);
const variables = [];

for (const [group, values] of Object.entries(tokens)) {
  for (const [name, value] of Object.entries(values)) {
    const kebabName = name.replaceAll(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
    variables.push(`  --ds-${group}-${kebabName}: ${toCssValue(group, value)};`);
  }
}

function toCssValue(group, value) {
  if (Array.isArray(value)) {
    return value.join(", ");
  }
  if (typeof value === "number") {
    return `${value}${group === "motion" ? "ms" : "px"}`;
  }
  return value;
}

const generated = [":root {", ...variables, "}", ""].join("\n");
const output = resolve(root, "web.css");

if (process.argv.includes("--check")) {
  const current = await readFile(output, "utf8");
  if (current !== generated) {
    throw new Error("web.css is stale. Run npm run design:sync.");
  }
} else {
  await writeFile(output, generated, "utf8");
}
