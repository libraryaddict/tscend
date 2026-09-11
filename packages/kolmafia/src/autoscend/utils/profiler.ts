import { bufferToFile, print as kolmafiaPrint } from "kolmafia";

interface Node {
  frame: number;
  children: Record<string, Node>;
  calls: number;
  self: number;
  total: number;
}

interface Frame {
  node: Node;
  start: number;
  child: number;
}

interface State {
  stack: Frame[];
  root: Node;
  ids: Record<string, number>;
  labels: string[];
}

// esbuild emits this module after its first callers run.
let state: State | undefined;

function newNode(frame: number): Node {
  return { frame, children: {}, calls: 0, self: 0, total: 0 };
}

// Called by the instrumentation in scripts/babel-plugin-profile.mjs.
export function profEnter(label: string): void {
  let current = state;
  if (!current) {
    current = state = {
      stack: [],
      root: newNode(-1),
      ids: {},
      labels: [],
    };
  }

  const { stack, ids, labels } = current;

  let id = ids[label];
  if (id === undefined) {
    id = labels.length;
    labels.push(label);
    ids[label] = id;
  }

  const parent = stack.length > 0 ? stack[stack.length - 1].node : current.root;
  let node = parent.children[id];
  if (!node) {
    node = newNode(id);
    parent.children[id] = node;
  }

  stack.push({ node, start: Date.now(), child: 0 });
}

export function profExit(): void {
  if (!state) return;

  const { stack } = state;
  const frame = stack.pop();
  if (!frame) return;

  const total = Date.now() - frame.start;

  if (stack.length > 0) stack[stack.length - 1].child += total;

  frame.node.calls++;
  frame.node.self += total - frame.child;
  frame.node.total += total;
}

function jsonString(value: string): string {
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function frameJson(label: string): string {
  const paren = label.lastIndexOf(" (");
  const colon = label.lastIndexOf(":");
  const name = label.slice(0, paren);
  const file = label.slice(paren + 2, colon);
  const line = label.slice(colon + 1, label.length - 1);
  return `{"name":${jsonString(name)},"file":${jsonString(file)},"line":${line}}`;
}

function walk(
  node: Node,
  path: number[],
  samples: string[],
  weights: number[],
): void {
  if (node.self > 0) {
    samples.push(`[${path.join(",")}]`);
    weights.push(node.self);
  }
  for (const key of Object.keys(node.children)) {
    const child = node.children[key];
    path.push(child.frame);
    walk(child, path, samples, weights);
    path.pop();
  }
}

export function printProfile(): void {
  if (!state) return;

  const { root, labels } = state;

  const samples: string[] = [];
  const weights: number[] = [];
  walk(root, [], samples, weights);

  const rows = labels.map((label) => ({ label, calls: 0, self: 0, total: 0 }));
  const pending: Node[] = [root];
  while (pending.length > 0) {
    const node = pending.pop() as Node;
    if (node !== root) {
      const row = rows[node.frame];
      row.calls += node.calls;
      row.self += node.self;
      row.total += node.total;
    }
    for (const key of Object.keys(node.children)) {
      pending.push(node.children[key]);
    }
  }

  const hot = rows
    .filter((row) => row.calls > 0)
    .sort((a, b) => b.self - a.self);

  kolmafiaPrint(
    `=== autoscend profile: ${hot.length} functions, ${hot.reduce((sum, r) => sum + r.calls, 0)} calls ===`,
    "blue",
  );
  kolmafiaPrint("self ms | total ms | calls | function", "blue");

  for (const row of hot.slice(0, 40)) {
    kolmafiaPrint(
      `${row.self} | ${row.total} | ${row.calls} | ${row.label}`,
      row.self > 1000 ? "red" : "blue",
    );
  }

  let elapsed = 0;
  for (const weight of weights) elapsed += weight;

  const json = [
    '{"$schema":"https://www.speedscope.app/file-format-schema.json",',
    '"name":"autoscend","exporter":"autoscend",',
    `"shared":{"frames":[${labels.map(frameJson).join(",")}]},`,
    '"profiles":[{"type":"sampled","name":"autoscend","unit":"milliseconds",',
    `"startValue":0,"endValue":${elapsed},`,
    `"samples":[${samples.join(",")}],`,
    `"weights":[${weights.join(",")}]}]}`,
  ].join("");

  bufferToFile(json, "autoscend_profile.speedscope.json");
  kolmafiaPrint(
    "Profile written to data/autoscend_profile.speedscope.json (open at speedscope.app)",
    "blue",
  );
}
