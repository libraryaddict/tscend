import { ESLintUtils } from "@typescript-eslint/utils";
import type { Position, TemplateElement } from "estree";

import { modifiers } from "./modifiers.mts";

const createRule = ESLintUtils.RuleCreator(
  (name) =>
    `https://github.com/libraryaddict/autoscend/blob/main/eslint-rules/${name}.mts`,
);

type Options = [
  {
    ignoreCapitalization?: boolean;
    ignoreUnrecognized?: boolean;
    data?: string[];
  },
];

type MessageIds =
  "unrecognizedValue" | "shouldBeCapitalized" | "invalidSeparator";

export const rule = createRule<Options, MessageIds>({
  name: "verify-modifiers",
  create(context) {
    const sourceCode = context.sourceCode;
    const options = context.options[0];

    const data: readonly string[] = options?.data ?? modifiers;
    const caseMap = new Map(
      data.map((name) => [name.toLowerCase(), name] as const),
    );

    function positionAdd(position: Position, offset: number) {
      return sourceCode.getLocFromIndex(
        sourceCode.getIndexFromLoc(position) + offset,
      );
    }

    function splitWithLocation(quasi: TemplateElement, pattern: RegExp) {
      const startOffset = quasi.value.raw.match(/^\s*/)![0].length;
      const endOffset = quasi.value.raw.match(/\s*$/)![0].length;
      // We have to add/subtract one here to deal with the backticks.
      const start = positionAdd(quasi.loc!.start, startOffset + 1);
      const end = positionAdd(quasi.loc!.end, -endOffset - 1);

      const result: [string, Position, Position][] = [];

      let match = null;
      let lastMatch: RegExpExecArray | null = null;
      const sliced = quasi.value.raw.slice(
        startOffset,
        quasi.value.raw.length - endOffset,
      );
      while ((match = pattern.exec(sliced)) !== null) {
        result.push([
          sliced.slice(
            lastMatch ? lastMatch.index + lastMatch[0].length : 0,
            match.index,
          ),
          positionAdd(
            start,
            lastMatch ? lastMatch.index + lastMatch[0].length : 0,
          ),
          positionAdd(start, match.index),
        ]);
        lastMatch = match;
      }
      result.push([
        sliced.slice(lastMatch ? lastMatch.index + lastMatch[0].length : 0),
        positionAdd(
          start,
          lastMatch ? lastMatch.index + lastMatch[0].length : 0,
        ),
        end,
      ]);

      return result;
    }

    return {
      TaggedTemplateExpression(node) {
        // For now just don't check constants if they contain other template literal expressions
        if (node.quasi.expressions.length > 0) return;
        const tagText = sourceCode.getText(node.tag);
        if (tagText !== "$modifier" && tagText !== "$modifiers") return;
        const isPlural = tagText === "$modifiers";

        for (const quasi of node.quasi.quasis) {
          const segments = isPlural
            ? splitWithLocation(quasi, /\s*,\s*/g)
            : splitWithLocation(quasi, /(?!)/g); // Never matches - don't split.

          for (const [segment, start, end] of segments) {
            const range: [number, number] = [
              sourceCode.getIndexFromLoc(start),
              sourceCode.getIndexFromLoc(end),
            ];
            const properlyCapitalized = caseMap.get(segment.toLowerCase());

            if (properlyCapitalized === undefined) {
              if (!options?.ignoreUnrecognized && segment !== "") {
                context.report({
                  node,
                  messageId: "unrecognizedValue",
                  data: { actual: segment },
                });
              }
            } else if (
              !options?.ignoreCapitalization &&
              segment !== properlyCapitalized
            ) {
              context.report({
                node,
                messageId: "shouldBeCapitalized",
                data: { actual: segment, expected: properlyCapitalized },
                fix(fixer) {
                  return fixer.replaceTextRange(range, properlyCapitalized);
                },
              });
            }
          }

          // FIXME: Allow on separate lines.
          const properlySpaced = segments
            .map(([segmentRaw]) => segmentRaw)
            .join(", ");
          if (quasi.value.raw !== properlySpaced) {
            context.report({
              node,
              messageId: "invalidSeparator",
              fix(fixer) {
                const [start, end] = quasi.range!;
                return fixer.replaceTextRange(
                  [start + 1, end - 1],
                  properlySpaced,
                );
              },
            });
          }
        }
      },
    };
  },
  defaultOptions: [
    {
      ignoreCapitalization: false,
      ignoreUnrecognized: false,
    },
  ],
  meta: {
    docs: {
      description:
        "Verify $modifier`...` / $modifiers`...` values against the known modifier list.",
    },
    messages: {
      unrecognizedValue: `Unrecognized modifier "{{actual}}".`,
      shouldBeCapitalized: `Modifier "{{actual}}" should be capitalized "{{expected}}".`,
      invalidSeparator: `Modifier constants should be separated by a comma and space.`,
    },
    fixable: "code",
    type: "suggestion",
    schema: [
      {
        type: "object",
        properties: {
          ignoreCapitalization: {
            type: "boolean",
            default: false,
          },
          ignoreUnrecognized: {
            type: "boolean",
            default: false,
          },
          data: {
            type: "array",
            items: { type: "string" },
          },
        },
        additionalProperties: false,
      },
    ],
  },
});
