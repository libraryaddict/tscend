// @ts-expect-error TS2591 - avoid @types/node in our packages
import { readFileSync, writeFileSync } from "fs";
import * as eslint from "@eslint/js";
import type { Rule } from "eslint";
import { defineConfig, globalIgnores } from "eslint/config";
import prettier from "eslint-config-prettier";
import libram, { verifyConstantsSinceRevision } from "eslint-plugin-libram";
import tseslint from "typescript-eslint";
import unusedImports from "eslint-plugin-unused-imports";
import importSort from "eslint-plugin-simple-import-sort";
import { rule as verifyModifiers } from "./eslint-rules/verify-modifiers.mts";
import { rule as verifyProperties } from "./eslint-rules/verify-properties.mts";

// KoLmafia revision is taken from package.json, update it there.
let cachedRevision = 0;

// We try to get the revision from libram's cache before making a http request
try {
  cachedRevision = parseInt(
    readFileSync(
      "node_modules/eslint-plugin-libram/data/revision.json",
      "utf-8",
    ),
  );
} catch {
  // No cached data yet or malformed file
}

const KOLMAFIA_VERSION = parseInt(
  JSON.parse(readFileSync("package.json", "utf-8")).resolutions.kolmafia.match(
    /\d+/g,
  )[1],
);

if (cachedRevision < KOLMAFIA_VERSION) {
  console.log(
    `Updating libram eslint plugin's data from ${cachedRevision} to ${KOLMAFIA_VERSION}`,
  );
  try {
    // Rational is that the plugin will always perform a http request when invoking this function, etag header may be neglibable, but we want to skip it if possible
    await verifyConstantsSinceRevision(KOLMAFIA_VERSION);
    // Write the version out, so we don't check it again
    writeFileSync(
      "node_modules/eslint-plugin-libram/data/revision.json",
      KOLMAFIA_VERSION.toString(),
    );
  } catch (error) {
    console.warn("Could not refresh libram eslint's data:", error);
  }
}

export default defineConfig(
  globalIgnores(["**/dist/**"]),
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...libram.configs.recommended,
  {
    languageOptions: {
      parserOptions: {
        sourceType: "module",
        ecmaVersion: "latest",
      },
    },
    plugins: {
      "unused-imports": unusedImports,
      "simple-import-sort": importSort,
      // @typescript-eslint/utils' rule type predates ESLint 10's RuleDefinition shape, hence the cast.
      local: {
        rules: {
          "verify-modifiers": verifyModifiers as unknown as Rule.RuleModule,
          "verify-properties": verifyProperties as unknown as Rule.RuleModule,
        },
      },
    },
    files: [
      "packages/**/src/**/*.ts",
      "packages/**/src/**/*.tsx",
      "**/*.ts",
      "**/*.tsx",
    ],
    rules: {
      "no-empty": "off",
      "block-scoped-var": "error",
      "eol-last": "error",
      eqeqeq: "error",
      "no-trailing-spaces": "error",
      "no-var": "error",
      "prefer-arrow-callback": "error",
      "prefer-const": "error",
      "prefer-template": "error",
      "no-unused-vars": "off",
      "no-useless-assignment": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-unused-expressions": "off",
      "no-restricted-syntax": [
        "error",
        {
          selector: "TSEnumDeclaration:not([const=true])",
          message: "Don't declare non-const enums",
        },
      ],
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
      "sort-imports": "off",
      "libram/verify-constants": "error",
      "local/verify-modifiers": "error",
      "local/verify-properties": "error",
      "unused-imports/no-unused-imports": "error",
      "no-fallthrough": [
        "error",
        { commentPattern: "INTENTIONAL LACK OF BREAK" },
      ],
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          args: "none",
        },
      ],
    },
  },
  prettier,
  {
    rules: {
      curly: ["error", "multi-line"],
    },
  },
);
