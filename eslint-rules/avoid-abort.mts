import { ESLintUtils } from "@typescript-eslint/utils";
import type { TSESTree } from "@typescript-eslint/utils";

const createRule = ESLintUtils.RuleCreator(
  (name) =>
    `https://github.com/libraryaddict/autoscend/blob/main/eslint-rules/${name}.mts`,
);

type MessageIds = "avoidAbort";

export const rule = createRule<[], MessageIds>({
  name: "avoid-abort",

  create(context) {
    return {
      CallExpression(node: TSESTree.CallExpression) {
        if (node.callee.type === "Identifier" && node.callee.name === "abort") {
          context.report({
            node,
            messageId: "avoidAbort",
          });
        }
      },
    };
  },

  defaultOptions: [],

  meta: {
    docs: {
      description: "Warn when abort() is called.",
    },
    messages: {
      avoidAbort: "Avoid calling abort(), use auto_abort() instead",
    },
    type: "suggestion",
    schema: [],
  },
});
