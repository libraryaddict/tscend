import { ESLintUtils } from "@typescript-eslint/utils";
import type {
  CallExpression,
  ImportDeclaration,
  MemberExpression,
} from "estree";

const createRule = ESLintUtils.RuleCreator(
  (name) =>
    `https://github.com/libraryaddict/autoscend/blob/main/eslint-rules/${name}.mts`,
);

// Maps each kolmafia Type to the libram $-tag constant that carries its "none" singleton.
const noneTags: Record<string, string> = {
  Bounty: "$bounty",
  Class: "$class",
  Coinmaster: "$coinmaster",
  Effect: "$effect",
  Element: "$element",
  Familiar: "$familiar",
  Item: "$item",
  Location: "$location",
  Modifier: "$modifier",
  Monster: "$monster",
  Path: "$path",
  Phylum: "$phylum",
  Servant: "$servant",
  Skill: "$skill",
  Slot: "$slot",
  Stat: "$stat",
  Thrall: "$thrall",
};

type MessageIds = "preferDollarNone";

// $-tag constants get re-exported through "kolmafia" in some files and imported directly
// from "libram" in others - both are valid homes for a newly-added specifier.
function isDollarImportSource(source: string): boolean {
  return source === "kolmafia" || source === "libram";
}

export const rule = createRule<[], MessageIds>({
  name: "verify-none",
  create(context) {
    const sourceCode = context.sourceCode;

    function dollarImports(): ImportDeclaration[] {
      return sourceCode.ast.body.filter(
        (node): node is ImportDeclaration =>
          node.type === "ImportDeclaration" &&
          typeof node.source.value === "string" &&
          isDollarImportSource(node.source.value),
      );
    }

    // Prefer an import that already has other $-tag specifiers, so the new one lands
    // in the natural group instead of alongside plain function/type imports.
    function findInsertionTarget(): ImportDeclaration | undefined {
      const candidates = dollarImports();
      return (
        candidates.find((decl) =>
          decl.specifiers.some(
            (specifier) =>
              specifier.type === "ImportSpecifier" &&
              specifier.imported.name.startsWith("$"),
          ),
        ) ?? candidates[0]
      );
    }

    function isTagImported(tagName: string): boolean {
      return dollarImports().some((decl) =>
        decl.specifiers.some(
          (specifier) =>
            specifier.type === "ImportSpecifier" &&
            specifier.imported.name === tagName,
        ),
      );
    }

    function report(node: MemberExpression | CallExpression, typeName: string) {
      const tagName = noneTags[typeName];
      if (!tagName) return;

      context.report({
        node,
        messageId: "preferDollarNone",
        data: { typeName, tagName },
        fix(fixer) {
          const fixes = [fixer.replaceText(node, `${tagName}.none`)];

          if (!isTagImported(tagName)) {
            const importDecl = findInsertionTarget();
            const lastSpecifier =
              importDecl?.specifiers[importDecl.specifiers.length - 1];
            if (lastSpecifier) {
              fixes.push(fixer.insertTextAfter(lastSpecifier, `, ${tagName}`));
            } else {
              fixes.push(
                fixer.insertTextBefore(
                  sourceCode.ast.body[0],
                  `import { ${tagName} } from "libram";\n`,
                ),
              );
            }
          }

          return fixes;
        },
      });
    }

    return {
      "MemberExpression[computed=false]"(node: MemberExpression) {
        if (
          node.property.type === "Identifier" &&
          node.property.name === "none" &&
          node.object.type === "Identifier"
        ) {
          report(node, node.object.name);
        }
      },
      CallExpression(node: CallExpression) {
        const callee = node.callee;
        if (
          callee.type === "MemberExpression" &&
          !callee.computed &&
          callee.property.type === "Identifier" &&
          callee.property.name === "get" &&
          callee.object.type === "Identifier" &&
          node.arguments.length === 1 &&
          node.arguments[0].type === "Literal" &&
          typeof node.arguments[0].value === "string" &&
          node.arguments[0].value.toLowerCase() === "none"
        ) {
          report(node, callee.object.name);
        }
      },
    };
  },
  defaultOptions: [],
  meta: {
    docs: {
      description: `Require $type.none (e.g. $monster.none) instead of Type.none or Type.get("none").`,
    },
    messages: {
      preferDollarNone: `Use "{{tagName}}.none" instead of "{{typeName}}.none" / "{{typeName}}.get(\\"none\\")".`,
    },
    fixable: "code",
    type: "suggestion",
    schema: [],
  },
});
