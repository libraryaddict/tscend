const TAGS = new Set([
  "$bounty",
  "$class",
  "$coinmaster",
  "$effect",
  "$element",
  "$familiar",
  "$item",
  "$location",
  "$modifier",
  "$monster",
  "$path",
  "$phylum",
  "$servant",
  "$skill",
  "$slot",
  "$stat",
  "$thrall",
]);

const memoized = new WeakSet();

export default function hoistConstantsPlugin({ types: t }) {
  return {
    name: "autoscend-hoist-constants",
    visitor: {
      Program: {
        enter(_programPath, state) {
          state.hoisted = new Map();
        },
        exit(programPath, state) {
          if (!state.hoisted.size) return;

          const body = programPath.node.body;
          let index = 0;
          for (const [i, statement] of body.entries()) {
            if (t.isImportDeclaration(statement)) index = i + 1;
          }

          // var, not let: a circular import can reach these before the declaration runs.
          body.splice(
            index,
            0,
            ...[...state.hoisted.values()].map((id) =>
              t.variableDeclaration("var", [t.variableDeclarator(id)]),
            ),
          );
        },
      },

      TaggedTemplateExpression(path, state) {
        if (memoized.has(path.node)) return;

        const { tag, quasi } = path.node;

        if (!t.isIdentifier(tag) || !TAGS.has(tag.name)) return;
        if (quasi.expressions.length > 0) return;
        if (path.scope.getBinding(tag.name)?.kind !== "module") return;

        const raw = quasi.quasis[0].value.raw;
        const key = `${tag.name}\`${raw}\``;

        let id = state.hoisted.get(key);
        if (!id) {
          id = path.scope.getProgramParent().generateUidIdentifier("c");
          state.hoisted.set(key, id);
        }

        const lookup = t.cloneNode(path.node, true);
        memoized.add(lookup);

        path.replaceWith(
          t.logicalExpression(
            "||",
            t.cloneNode(id),
            t.assignmentExpression("=", t.cloneNode(id), lookup),
          ),
        );
      },
    },
  };
}
