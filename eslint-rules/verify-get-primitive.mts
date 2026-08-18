import { ESLintUtils } from "@typescript-eslint/utils";
import type { TSESTree } from "@typescript-eslint/utils";

import {
  isNonPrimitiveGetCategory,
  primitiveGetCategory,
} from "./internal-properties.mts";

const createRule = ESLintUtils.RuleCreator(
  (name) =>
    `https://github.com/libraryaddict/autoscend/blob/main/eslint-rules/${name}.mts`,
);

type MessageIds = "nonPrimitiveGet" | "nonPrimitiveComparedToString";

// safeGet()'s overloads exist specifically to hand back a typed Location/Monster/Familiar/
// Item/Stat/Phylum, so a non-primitive result is the intended, common case there - unlike
// get(), where it means a bypass of the typed helpers. safeGet() only earns a warning when
// its non-primitive result is compared against a string literal, which can never be true.
function isComparedToStringLiteral(node: TSESTree.Node): boolean {
  const parent = node.parent;
  if (parent?.type !== "BinaryExpression") return false;
  if (!["==", "===", "!=", "!=="].includes(parent.operator)) return false;

  const other = parent.left === node ? parent.right : parent.left;
  return other.type === "Literal" && typeof other.value === "string";
}

export const rule = createRule<[], MessageIds>({
  name: "verify-get-primitive",
  create(context) {
    return {
      CallExpression(node) {
        if (node.callee.type !== "Identifier") return;
        const isSafeGet = node.callee.name === "safeGet";
        if (!isSafeGet && node.callee.name !== "get") return;

        const [propertyArg] = node.arguments;
        if (!propertyArg || propertyArg.type !== "Literal") return;
        if (typeof propertyArg.value !== "string") return;

        const property = propertyArg.value;
        const category = primitiveGetCategory(property);
        if (category === undefined || !isNonPrimitiveGetCategory(category)) {
          return;
        }

        if (isSafeGet) {
          if (!isComparedToStringLiteral(node)) return;

          context.report({
            node,
            messageId: "nonPrimitiveComparedToString",
            data: { property, category },
          });
          return;
        }

        context.report({
          node: propertyArg,
          messageId: "nonPrimitiveGet",
          data: { property, category },
        });
      },
    };
  },
  defaultOptions: [],
  meta: {
    docs: {
      description:
        "Warn when get() is called on a property whose value isn't a boolean/number/string - libram resolves those by looking the name up as a Familiar/Location/Item/Monster/Stat/Phylum, which is a much easier way to introduce a bug than a plain primitive. Also warns when safeGet() on such a property is compared against a string literal, which can never be true.",
    },
    messages: {
      nonPrimitiveGet: `Property "{{property}}" resolves to a "{{category}}", not a boolean/int/float/string. Confirm get() here is intentional.`,
      nonPrimitiveComparedToString: `Property "{{property}}" resolves to a "{{category}}" via safeGet(), which can never equal a string literal.`,
    },
    type: "suggestion",
    schema: [],
  },
});
