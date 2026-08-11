// Runs eslint --fix then prettier --write - prettier must run after eslint
// since eslint's fixes need reformatting, so these stay sequential.
import { spawn } from "child_process";

import { main as generateProperties } from "../eslint-rules/scripts/generate-property-declarations.mjs";
import { main as sortInternal } from "../eslint-rules/scripts/sort-internal-yml.mjs";

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

try {
  await sortInternal();
  await generateProperties();

  await run("yarn", [
    "eslint",
    "packages",
    "--fix",
    "--cache",
    "--cache-location",
    "node_modules/.cache/.eslintcache",
  ]);

  await run("yarn", [
    "prettier",
    "--write",
    ".",
    "--cache",
    "--cache-location",
    "node_modules/.cache/.prettiercache",
    "--log-level",
    "warn",
  ]);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
