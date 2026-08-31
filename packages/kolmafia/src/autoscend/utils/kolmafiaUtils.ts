/* eslint-disable @typescript-eslint/no-explicit-any */
import { fileToBuffer, myPath, myTurncount, Path } from "kolmafia";

// Path changes on beating the Naughty Sorceress, and again on freeing the King.
let currentPath: Path | undefined;
let currentPathTurn = -1;

export function invalidatePath(): void {
  currentPath = undefined;
}

export function auto_inPath(name: string): boolean {
  if (!currentPath || currentPathTurn !== myTurncount()) {
    currentPath = myPath();
    currentPathTurn = myTurncount();
  }
  return currentPath.name === name;
}

// Wrap a class in ctor(...) to construct it from the remaining columns.
export class CtorLeaf<T> {
  constructor(public readonly ctor: new (...args: string[]) => T) {}
}
export function ctor<T>(target: new (...args: string[]) => T): CtorLeaf<T> {
  return new CtorLeaf(target);
}

type Schema<T = any> =
  | StringConstructor
  | NumberConstructor
  | "string[]"
  | ((raw: string) => T)
  | CtorLeaf<T>;

type Value<C> =
  C extends CtorLeaf<infer T>
    ? T
    : C extends StringConstructor
      ? string
      : C extends NumberConstructor
        ? number
        : C extends "string[]"
          ? string[]
          : C extends (raw: string) => infer T
            ? T
            : never;

// "string[]" and CtorLeaf consume all remaining columns; everything else is
// a `(raw: string) => T` conversion of the single column at `depth`.
function resolveLeaf(leaf: Schema, parts: string[], depth: number): any {
  if (leaf === "string[]") return parts.slice(depth);
  if (leaf instanceof CtorLeaf) return new leaf.ctor(...parts.slice(depth));
  return (leaf as (raw: string) => any)(parts[depth] ?? "");
}

// One Map<key, ...> layer per schema entry; the last entry is the leaf value, not a key.
type NestedMap<S extends readonly Schema[]> = S extends readonly [
  infer Only extends Schema,
]
  ? Value<Only>
  : S extends readonly [
        infer Head extends Schema,
        ...infer Rest extends Schema[],
      ]
    ? Map<Value<Head>, NestedMap<Rest>>
    : never;

// Replacement for fileToMap, could've returned tuples, but eh.
export function fileAsMap<
  const S extends readonly [Schema, Schema, ...Schema[]],
>(filename: string, schema: S): NestedMap<S> {
  const depth = schema.length - 1;
  const root = new Map<any, any>();

  for (const line of fileToBuffer(filename).split(/\r?\n/)) {
    if (!line || line.startsWith("#")) continue;

    const parts = line.split("\t");
    let current = root;

    for (let i = 0; i < depth; i++) {
      const key = (schema[i] as (raw: string) => any)(parts[i] ?? "");

      if (i < depth - 1) {
        if (!current.has(key)) current.set(key, new Map());
        current = current.get(key);
        continue;
      }

      current.set(key, resolveLeaf(schema[depth], parts, depth));
    }
  }

  return root as NestedMap<S>;
}
