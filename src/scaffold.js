import { execFile } from "node:child_process";
import {
  access,
  cp,
  mkdir,
  readdir,
  readFile,
  rename,
  writeFile,
} from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const npmExecutable = process.platform === "win32" ? "npm.cmd" : "npm";
const templateDirectory = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../template",
);

export async function scaffoldProject(options) {
  const target = resolve(options.cwd, options.projectName);
  await assertEmptyTarget(target);
  await mkdir(target, { recursive: true });
  await cp(templateDirectory, target, { recursive: true });
  await rename(join(target, "_gitignore"), join(target, ".gitignore"));
  await replaceProjectName(target, options.projectName);

  if (options.install) {
    await execute(options, npmExecutable, ["install"], target);
  }

  return target;
}

async function assertEmptyTarget(target) {
  try {
    await access(target);
  } catch {
    return;
  }

  const entries = await readdir(target);
  if (entries.length > 0) {
    throw new Error(`Target directory is not empty: ${target}`);
  }
}

async function replaceProjectName(directory, projectName) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      await replaceProjectName(path, projectName);
      continue;
    }
    const contents = await readFile(path, "utf8");
    await writeFile(
      path,
      contents
        .replaceAll("__PROJECT_NAME__", projectName)
        .replaceAll("__PROJECT_IDENTIFIER__", `app${projectName.replaceAll("-", "")}`),
      "utf8",
    );
  }
}

async function execute(options, command, argumentsList, cwd) {
  if (options.runCommand) {
    await options.runCommand(command, argumentsList, cwd);
    return;
  }
  await execFileAsync(command, argumentsList, {
    cwd,
    maxBuffer: 10 * 1024 * 1024,
  });
}
