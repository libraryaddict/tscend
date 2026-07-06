// esbuild.mjs
import esbuild from "esbuild";
import babel from "esbuild-plugin-babel";
import { readFileSync } from "fs";

await esbuild.build({
  entryPoints: {
    autoscend: "RELEASE/scripts/index.ts",
    "autoscend/auto_choice_adv": "RELEASE/scripts/autoscend/auto_choice_adv.ts",
    "autoscend/auto_post_adv": "RELEASE/scripts/autoscend/auto_post_adv.ts",
    "autoscend/auto_pre_adv": "RELEASE/scripts/autoscend/auto_pre_adv.ts",
  },
  bundle: true,
  outdir: "dist",
  external: ["kolmafia"],
  "mainFields": ["main"],
  format:"cjs",
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
