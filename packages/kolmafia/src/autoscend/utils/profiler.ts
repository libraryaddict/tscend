import { bufferToFile, print as kolmafiaPrint } from "kolmafia";

interface Frame {
  label: string;
  start: number;
  child: number;
}

interface Totals {
  calls: number;
  self: number;
  total: number;
}

// esbuild emits this module after its first callers run.
let stack: Frame[] | undefined;
let totals: Record<string, Totals> | undefined;

// Called by the instrumentation in scripts/babel-plugin-profile.mjs.
export function profEnter(label: string): void {
  if (!stack) stack = [];
  stack.push({ label, start: Date.now(), child: 0 });
}

export function profExit(): void {
  if (!stack) return;

  const frame = stack.pop();
  if (!frame) return;

  const total = Date.now() - frame.start;

  if (stack.length > 0) stack[stack.length - 1].child += total;

  if (!totals) totals = {};

  let entry = totals[frame.label];
  if (!entry) {
    entry = { calls: 0, self: 0, total: 0 };
    totals[frame.label] = entry;
  }

  entry.calls++;
  entry.self += total - frame.child;
  entry.total += total;
}

export function printProfile(): void {
  if (!totals) return;

  const data = totals;
  const rows = Object.keys(data)
    .map((label) => ({ label, ...data[label] }))
    .sort((a, b) => b.self - a.self);

  kolmafiaPrint(
    `=== autoscend profile: ${rows.length} functions, ${rows.reduce((sum, r) => sum + r.calls, 0)} calls ===`,
    "blue",
  );
  kolmafiaPrint("self ms | total ms | calls | function", "blue");

  for (const row of rows.slice(0, 40)) {
    kolmafiaPrint(
      `${row.self} | ${row.total} | ${row.calls} | ${row.label}`,
      row.self > 1000 ? "red" : "blue",
    );
  }

  const csv = rows
    .map((r) => `${r.self},${r.total},${r.calls},"${r.label}"`)
    .join("\n");
  bufferToFile(
    `self_ms,total_ms,calls,function\n${csv}\n`,
    "autoscend_profile.csv",
  );
  kolmafiaPrint("Full profile written to data/autoscend_profile.csv", "blue");
}
