// Runs typecheck and bundle in parallel - they're independent (esbuild strips
// types without checking them), so there's no need to wait for tsc to finish
// before bundling.
import { spawn } from "child_process";

import { main as generateProperties } from "../eslint-rules/scripts/generate-property-declarations.mjs";

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: "inherit" });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else
        reject(
          new Error(`${command} ${args.join(" ")} exited with code ${code}`),
        );
    });
  });
}

await generateProperties();

try {
  await Promise.all([run("yarn", ["tsc", "-b"]), run("node", ["esbuild.mjs"])]);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
