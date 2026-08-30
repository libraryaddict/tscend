import { ESLintUtils } from "@typescript-eslint/utils";
import type { TSESTree } from "@typescript-eslint/utils";

const createRule = ESLintUtils.RuleCreator(
  (name) =>
    `https://github.com/libraryaddict/autoscend/blob/main/eslint-rules/${name}.mts`,
);

type MessageIds = "avoidRawCall";

const RESTRICTED_CALLS: Record<string, string> = {
  abort: "auto_abort()",
  adv1: "auto_adv1()",
  runChoice: "auto_runChoice()",
  adventure: "autoAdv()",
};

export const rule = createRule<[], MessageIds>({
  name: "avoid-abort",

  create(context) {
    return {
      CallExpression(node: TSESTree.CallExpression) {
        if (node.callee.type !== "Identifier") return;

        const replacement = RESTRICTED_CALLS[node.callee.name];

        if (!replacement) return;

        context.report({
          node,
          messageId: "avoidRawCall",
          data: { name: node.callee.name, replacement },
        });
      },
    };
  },

  defaultOptions: [],

  meta: {
    docs: {
      description:
        "Warn when a raw kolmafiafunction is called instead of the wrapper.",
    },
    messages: {
      avoidRawCall: "Avoid calling {{name}}(), use {{replacement}} instead",
    },
    type: "suggestion",
    schema: [],
  },
});
