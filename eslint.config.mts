import * as eslint from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import prettier from "eslint-config-prettier";
import libram, { verifyConstantsSinceRevision } from "eslint-plugin-libram";
import tseslint from "typescript-eslint";
import unusedImports from "eslint-plugin-unused-imports";
import importSort from "eslint-plugin-simple-import-sort";

const KOLMAFIA_VERSION = 28984;
await verifyConstantsSinceRevision(KOLMAFIA_VERSION);

export default defineConfig(
  globalIgnores(["dist/**"]),
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
    },
    files: ["src/**/*.ts", "src/**/*.tsx", "**/*.ts", "**/*.tsx"],
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
);
