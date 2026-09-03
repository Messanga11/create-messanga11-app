import process from "node:process";
import { scaffoldProject } from "./scaffold.js";

const HELP = `create-messanga11-app <project-name> [--preset <name>] [--no-install]

Creates a monorepo containing:
  apps/web       Next.js App Router
  apps/mobile    Expo Router
  packages/domain  Shared @messanga11/core policies and schemas

Presets: saas, admin, commerce, delivery, booking, marketplace, content, custom
`;

const PRESETS = new Set([
  "admin",
  "booking",
  "commerce",
  "content",
  "custom",
  "delivery",
  "marketplace",
  "saas",
]);

export async function run(argumentsList, options = {}) {
  try {
    const argumentsResult = parseArguments(argumentsList);
    if (argumentsResult.help) {
      writeOutput(options, HELP);
      return;
    }

    const target = await scaffoldProject({
      cwd: options.cwd ?? process.cwd(),
      install: argumentsResult.install,
      preset: argumentsResult.preset,
      projectName: argumentsResult.projectName,
      runCommand: options.runCommand,
    });
    writeOutput(
      options,
      `\nCreated ${argumentsResult.projectName} in ${target}\n\n` +
        `Next steps:\n  cd ${argumentsResult.projectName}\n` +
        `${argumentsResult.install ? "" : "  npm install\n"}` +
        `  npm run dev:web\n\n` +
        `In another terminal:\n  npm run dev:mobile\n`,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error.";
    writeError(options, `create-messanga11-app: ${message}\n`);
    if (options.throwOnError) {
      throw error;
    }
    process.exitCode = 1;
  }
}

export function parseArguments(argumentsList) {
  let install = true;
  let projectName;
  let preset = "admin";

  for (let index = 0; index < argumentsList.length; index += 1) {
    const argument = argumentsList[index];
    if (argument === "--help" || argument === "-h") {
      return { help: true, install, projectName: "" };
    }
    if (argument === "--no-install") {
      install = false;
      continue;
    }
    if (argument === "--preset") {
      const value = argumentsList[index + 1];
      if (!value || value.startsWith("-"))
        throw new Error("--preset requires a value.");
      preset = value;
      index += 1;
      continue;
    }
    if (argument.startsWith("--preset=")) {
      preset = argument.slice("--preset=".length);
      continue;
    }
    if (argument.startsWith("-")) {
      throw new Error(`Unknown option: ${argument}`);
    }
    if (projectName) {
      throw new Error("Provide exactly one project name.");
    }
    projectName = argument;
  }

  if (!projectName) {
    throw new Error(`A project name is required.\n\n${HELP}`);
  }
  if (!PRESETS.has(preset)) {
    throw new Error(`Unknown preset: ${preset}.`);
  }
  if (!/^[a-z0-9][a-z0-9-]{0,49}$/.test(projectName)) {
    throw new Error(
      "Project names must use 1-50 lowercase letters, numbers, or hyphens.",
    );
  }

  return { help: false, install, preset, projectName };
}

function writeOutput(options, message) {
  (options.stdout ?? process.stdout).write(message);
}

function writeError(options, message) {
  (options.stderr ?? process.stderr).write(message);
}
