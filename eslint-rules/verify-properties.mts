import { ESLintUtils } from "@typescript-eslint/utils";
import type { Expression } from "estree";

import {
  internalProperties,
  isKnownProperty,
  knownPropertyNames,
} from "./internal-properties.mts";

const createRule = ESLintUtils.RuleCreator(
  (name) =>
    `https://github.com/libraryaddict/autoscend/blob/main/eslint-rules/${name}.mts`,
);

type Options = [
  {
    data?: ReadonlyMap<string, string>;
  },
];

type MessageIds = "unregisteredProperty" | "typeMismatch" | "changeValueTo";

// Levenshtein edit distance, used to suggest a fix for likely typos.
function editDistance(a: string, b: string): number {
  const dp: number[][] = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) =>
      i === 0 ? j : j === 0 ? i : 0,
    ),
  );

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }

  return dp[a.length][b.length];
}

// Only suggest close-enough typo fixes, not unrelated properties.
function findSuggestions(
  property: string,
  candidates: readonly string[],
): string[] {
  const maxDistance = property.length <= 4 ? 1 : 2;
  const scored = candidates
    .map((name) => ({ name, distance: editDistance(property, name) }))
    .filter(({ distance }) => distance > 0 && distance <= maxDistance)
    .sort((a, b) => a.distance - b.distance);

  const best = scored[0]?.distance;
  if (best === undefined) return [];
  return scored.filter(({ distance }) => distance === best).map((s) => s.name);
}

function typeCategory(type: string): string {
  if (type === "int" || type === "float") {
    return "number";
  }

  return type;
}

// Best-effort: only judges literals and `Thing.none`-style defaults; everything else
// (variables, function calls, ternaries, ...) is left unchecked.
function inferCategory(node: Expression): string | null {
  if (node.type === "Literal") {
    if (typeof node.value === "boolean") return "boolean";
    if (typeof node.value === "number") return "number";
    if (typeof node.value === "string") return "string";
    return null;
  }

  if (
    node.type === "MemberExpression" &&
    !node.computed &&
    node.object.type === "Identifier" &&
    node.property.type === "Identifier" &&
    node.property.name === "none"
  ) {
    return node.object.name.replace(/^\$/, "").toLowerCase();
  }

  return null;
}

export const rule = createRule<Options, MessageIds>({
  name: "verify-properties",
  create(context) {
    const options = context.options[0];
    const usingCustomData = options?.data !== undefined;
    const data = options?.data ?? internalProperties;

    return {
      CallExpression(node) {
        if (node.callee.type !== "Identifier") return;
        const name = node.callee.name;
        if (name !== "get" && name !== "getProperty" && name !== "set") {
          return;
        }

        const [propertyArg, valueArg] = node.arguments;
        if (!propertyArg || propertyArg.type !== "Literal") return;
        if (typeof propertyArg.value !== "string") return;

        const property = propertyArg.value;
        const registeredType = data.get(property);

        if (
          registeredType === undefined &&
          !usingCustomData &&
          !isKnownProperty(property)
        ) {
          const suggestions = findSuggestions(property, knownPropertyNames);

          context.report({
            node: propertyArg,
            messageId: "unregisteredProperty",
            data: { property },
            suggest: suggestions.map((suggestion) => ({
              messageId: "changeValueTo",
              data: { expected: suggestion },
              fix: (fixer) =>
                fixer.replaceText(propertyArg, JSON.stringify(suggestion)),
            })),
          });
          return;
        }

        // Only type-check properties we define ourselves - libram-known ones are often read/set
        // via raw calls that bypass its typed helpers (e.g. clearing to ""), which isn't a bug.
        if (
          registeredType === undefined ||
          name === "getProperty" ||
          !valueArg ||
          registeredType === "unknown"
        ) {
          return;
        }
        if (valueArg.type === "SpreadElement") return;

        const inferred = inferCategory(valueArg as Expression);
        if (inferred === null) return;

        const expected = typeCategory(registeredType);
        // KoL properties are always stored as strings under the hood, so a raw string value
        // (e.g. "", "true", "3") is always valid regardless of nominal type. Only flag
        // concrete, conflicting non-string types (e.g. a Location default for a Familiar).
        if (
          inferred !== expected &&
          inferred !== "string" &&
          expected !== "string"
        ) {
          context.report({
            node: valueArg,
            messageId: "typeMismatch",
            data: { property, expected, actual: inferred },
          });
        }
      },
    };
  },
  defaultOptions: [{}],
  meta: {
    docs: {
      description:
        "Verify get()/getProperty()/set() calls use property names registered in data/settings/, and that the value/default type matches.",
    },
    messages: {
      unregisteredProperty: `Unrecognized property "{{property}}". Register it in data/settings/.`,
      typeMismatch: `Property "{{property}}" is a "{{expected}}" but this call uses a "{{actual}}" value.`,
      changeValueTo: `Change to "{{expected}}"`,
    },
    hasSuggestions: true,
    type: "problem",
    schema: [
      {
        type: "object",
        properties: {
          data: { type: "object" },
        },
        additionalProperties: false,
      },
    ],
  },
});
