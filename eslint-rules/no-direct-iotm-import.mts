import { ESLintUtils } from "@typescript-eslint/utils";
import type { TSESTree } from "@typescript-eslint/utils";

const createRule = ESLintUtils.RuleCreator(
  (name) =>
    `https://github.com/libraryaddict/autoscend/blob/main/eslint-rules/${name}.mts`,
);

type MessageIds = "noDirectIotmImport";

export const rule = createRule<[], MessageIds>({
  name: "no-direct-iotm-import",

  create(context) {
    if (context.filename.replace(/\\/g, "/").endsWith("/src/types.ts")) {
      return {};
    }

    return {
      ImportDeclaration(node: TSESTree.ImportDeclaration) {
        if (!/\/iotms\//.test(node.source.value)) return;

        context.report({
          node: node.source,
          messageId: "noDirectIotmImport",
        });
      },
    };
  },

  defaultOptions: [],

  meta: {
    docs: {
      description:
        "Warn when importing directly from an iotms/ module instead of its namespace export in types.ts.",
    },
    messages: {
      noDirectIotmImport:
        'Don\'t import directly from an iotms/ module. Import its namespace from "types" instead (e.g. `import { AprilingBand } from "../types"`).',
    },
    type: "suggestion",
    schema: [],
  },
});
