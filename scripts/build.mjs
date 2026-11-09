// Runs in parallel - esbuild strips types without checking them.
import { spawn } from "child_process";
import { existsSync, statSync } from "fs";

import { main as generateProperties } from "../eslint-rules/scripts/generate-property-declarations.mjs";

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: "inherit" });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else {
        reject(
          new Error(`${command} ${args.join(" ")} exited with code ${code}`),
        );
      }
    });
  });
}

const manifests = [
  "package.json",
  "yarn.lock",
  "packages/shared/package.json",
  "packages/kolmafia/package.json",
  "packages/relay/package.json",
  "packages/browser/package.json",
];
const installState = "node_modules/.yarn-state.yml";
const installedAt = existsSync(installState)
  ? statSync(installState).mtimeMs
  : 0;

if (manifests.some((file) => statSync(file).mtimeMs > installedAt)) {
  await run("yarn", ["install"]);
}

await generateProperties();

try {
  await Promise.all([run("yarn", ["tsc", "-b"]), run("node", ["esbuild.mjs"])]);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
