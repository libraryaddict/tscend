import path from "path";

const RUNTIME = path.resolve(
  "packages/kolmafia/src/autoscend/utils/profiler.ts",
);

const INCLUDE = path.resolve("packages/kolmafia/src");

function nameOf(t, fnPath) {
  const node = fnPath.node;

  if (node.id) return node.id.name;

  if (node.key) {
    const key = t.isIdentifier(node.key) ? node.key.name : "computed";
    const cls = fnPath.findParent((p) => p.isClass());
    return cls?.node.id ? `${cls.node.id.name}.${key}` : key;
  }

  const parent = fnPath.parent;
  if (t.isVariableDeclarator(parent) && t.isIdentifier(parent.id)) {
    return parent.id.name;
  }
  if (t.isObjectProperty(parent) && t.isIdentifier(parent.key)) {
    return parent.key.name;
  }
  // Class fields are already assignments by the time this runs.
  if (t.isAssignmentExpression(parent) && t.isMemberExpression(parent.left)) {
    return parent.left.property.name;
  }
  if (t.isCallExpression(parent)) {
    const callee = parent.callee;
    if (t.isIdentifier(callee)) return `${callee.name}()callback`;
    if (t.isMemberExpression(callee))
      return `.${callee.property.name}()callback`;
  }
  return "anonymous";
}

export default function profilePlugin({ types: t }, options) {
  const includeArrows = options.arrows;

  return {
    name: "autoscend-profile",
    visitor: {
      Program: {
        enter(_programPath, state) {
          state.profSkip =
            !state.filename.startsWith(INCLUDE) || state.filename === RUNTIME;
          state.profIds = null;
        },
        exit(programPath, state) {
          if (!state.profIds) return;

          programPath.unshiftContainer(
            "body",
            t.importDeclaration(
              [
                t.importSpecifier(
                  t.cloneNode(state.profIds.enter),
                  t.identifier("profEnter"),
                ),
                t.importSpecifier(
                  t.cloneNode(state.profIds.exit),
                  t.identifier("profExit"),
                ),
              ],
              t.stringLiteral(RUNTIME),
            ),
          );
        },
      },

      Function(fnPath, state) {
        if (state.profSkip) return;

        const node = fnPath.node;

        // Nodes without loc were synthesised by another plugin.
        if (!node.loc) return;
        if (t.isArrowFunctionExpression(node) && !includeArrows) return;
        if (!t.isBlockStatement(node.body)) {
          node.body = t.blockStatement([t.returnStatement(node.body)]);
        }

        if (!state.profIds) {
          const scope = fnPath.scope.getProgramParent();
          state.profIds = {
            enter: scope.generateUidIdentifier("profEnter"),
            exit: scope.generateUidIdentifier("profExit"),
          };
        }

        const relative = path.relative(INCLUDE, state.filename);
        const label = `${nameOf(t, fnPath)} (${relative}:${node.loc.start.line})`;

        const body = node.body;
        body.body = [
          t.expressionStatement(
            t.callExpression(t.cloneNode(state.profIds.enter), [
              t.stringLiteral(label),
            ]),
          ),
          t.tryStatement(
            t.blockStatement(body.body),
            null,
            t.blockStatement([
              t.expressionStatement(
                t.callExpression(t.cloneNode(state.profIds.exit), []),
              ),
            ]),
          ),
        ];
      },
    },
  };
}
