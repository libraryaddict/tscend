// esbuild.mjs
import esbuild from "esbuild";
import babel from "esbuild-plugin-babel";
import { readFileSync } from "fs";

await esbuild.build({
  entryPoints: {
    "relay/relay_autoscend": "src/relay_autoscend.ts",
    "scripts/autoscend": "src/index.ts",
    "scripts/autoscend/auto_choice_adv": "src/autoscend/auto_choice_adv.ts",
    "scripts/autoscend/auto_post_adv": "src/autoscend/auto_post_adv.ts",
    "scripts/autoscend/auto_pre_adv": "src/autoscend/auto_pre_adv.ts",
  },
  bundle: true,
  outdir: "RELEASE/",
  external: ["kolmafia"],
  mainFields: ["main"],
  format: "cjs",
  plugins: [
    babel({
      filter: /\.[jt]sx?$/,
      configFile: "./babel.config.json",
    }),
  ],
  loader: {
    ".ts": "ts",
  },
});
