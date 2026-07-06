import { fileToBuffer } from "kolmafia";

// Wrap a class in ctor(...) to construct it from the remaining columns.
export class CtorLeaf<T> {
  constructor(public readonly ctor: new (...args: string[]) => T) {}
}
export function ctor<T>(target: new (...args: string[]) => T): CtorLeaf<T> {
  return new CtorLeaf(target);
}

type Schema<T = any> =
  StringConstructor | NumberConstructor | ((raw: string) => T) | CtorLeaf<T>;

type Value<C> =
  C extends CtorLeaf<infer T>
    ? T
    : C extends StringConstructor
      ? string
      : C extends NumberConstructor
        ? number
        : C extends (raw: string) => infer T
          ? T
          : never;

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

      const leaf = schema[depth];
      current.set(
        key,
        leaf instanceof CtorLeaf
          ? new leaf.ctor(...parts.slice(depth))
          : (leaf as (raw: string) => any)(parts[depth] ?? ""),
      );
    }
  }

  return root as NestedMap<S>;
}

// Replacement for kolmafia's regex functions, generated via llm and pending replacement. This is meant to be a stand-in.
export class AshMatcher {
  pattern: RegExp;
  string: string;
  match: RegExpExecArray | null = null;
  appendPosition: number = 0;

  constructor(pattern: string, string: string) {
    this.pattern = new RegExp(pattern, "gs");
    this.string = string;
  }

  find() {
    return (this.match = this.pattern.exec(this.string)) !== null;
  }

  group(group: number | string = 0) {
    if (!this.match) return "";
    if (typeof group === "number")
      return (this.match as any)[group] !== undefined
        ? (this.match as any)[group]
        : "";
    return this.match.groups && this.match.groups[group] !== undefined
      ? this.match.groups[group]
      : "";
  }

  // [start, end] for a group, or [-1, -1] if it didn't participate / can't be located.
  // Group 0 is exact; subgroups are located left-to-right in the match (exact for
  // ordered, unambiguous captures — approximate for nested/repeated ones).
  private _span(group: number): [number, number] {
    if (!this.match) return [-1, -1];
    const base = this.match.index;
    if (group === 0) return [base, base + this.match[0].length];
    if ((this.match as any)[group] === undefined) return [-1, -1];
    let cursor = 0;
    for (let g = 1; g <= group; g++) {
      const t = (this.match as any)[g];
      if (t === undefined) continue;
      const at = this.match[0].indexOf(t, cursor);
      if (at === -1) return [-1, -1];
      if (g === group) return [base + at, base + at + t.length];
      cursor = at + t.length;
    }
    return [-1, -1];
  }

  start(group: number = 0) {
    return this._span(group)[0];
  }
  end(group: number = 0) {
    return this._span(group)[1];
  }

  groupCount() {
    return (new RegExp(`${this.pattern.source}|`).exec("")?.length || 1) - 1;
  }

  groupNames() {
    const res = new Map();
    for (const match of this.pattern.source.matchAll(
      /\(\?<([a-zA-Z][a-zA-Z0-9]*)>/g,
    )) {
      res.set(match[1], true);
    }
    return res;
  }

  // Convert Java-style tokens ($0, $1.., ${name}, \x) into a native JS replacement string.
  private _toReplacement(replacement: string): string {
    return replacement.replace(
      /\\(.)|\$([0-9]+)|\$\{([a-zA-Z][a-zA-Z0-9]*)\}/g,
      (m, esc, g, n) => {
        if (esc !== undefined) return esc === "$" ? "$$" : esc; // \$ -> literal $, \x -> x
        if (g !== undefined) return g === "0" ? "$&" : `$${g}`; // $0 -> whole match, $n -> group n
        if (n !== undefined) return `$<${n}>`; // ${name} -> $<name>
        return m;
      },
    );
  }

  replaceAll(replacement: string) {
    return this.string.replace(this.pattern, this._toReplacement(replacement));
  }

  replaceFirst(replacement: string) {
    const nonGlobal = new RegExp(
      this.pattern.source,
      this.pattern.flags.replace("g", ""),
    );
    return this.string.replace(nonGlobal, this._toReplacement(replacement));
  }

  reset(string?: string) {
    this.pattern.lastIndex = 0;
    this.match = null;
    this.appendPosition = 0;
    if (string !== undefined) this.string = string;
    return this;
  }

  appendReplacement(replacement: string) {
    const rep = replacement.replace(
      /\\(.)|\$([0-9]+)|\$\{([a-zA-Z][a-zA-Z0-9]*)\}/g,
      (m, esc, g, n) => {
        if (esc !== undefined) return esc;
        if (g === "0") return this.match![0];
        if (g !== undefined) return (this.match as any)[g] || "";
        if (n !== undefined) return this.match!.groups?.[n] || "";
        return m;
      },
    );
    const res =
      this.string.substring(this.appendPosition, this.match!.index) + rep;
    this.appendPosition = this.pattern.lastIndex;
    return res;
  }

  appendTail() {
    return this.string.substring(this.appendPosition);
  }
}
