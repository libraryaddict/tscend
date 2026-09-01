import { abort as kolmafiaAbort, print as kolmafiaPrint } from "kolmafia";
import { get } from "libram";

function auto_log(s: string, color: string, log_level: number): void {
  if (log_level > get("auto_log_level", 0)) {
    return;
  }
  if (s === "") {
    kolmafiaPrint("");
    return;
  }
  switch (log_level) {
    case 1:
      kolmafiaPrint(`[WARNING] ${s}`, color);
      break;
    case 2:
      kolmafiaPrint(`[INFO] ${s}`, color);
      break;
    case 3:
      kolmafiaPrint(`[DEBUG] ${s}`, color);
      break;
  }
}

export function auto_log_error(s: string): void {
  kolmafiaPrint(`[ERROR] ${s}`, "red");
}

export function auto_log_warning(s: string, color: string = "orange"): void {
  auto_log(s, color, 1);
}

export function auto_log_info(s: string = "", color: string = "blue"): void {
  auto_log(s, color, 2);
}

export function auto_log_debug(s: string, color: string = "gray"): void {
  auto_log(s, color, 3);
}

export function auto_abort(
  s: string | string[] = "Script aborted with no reason",
): never {
  const lines: string[] = Array.isArray(s) ? s : [s];
  lines.forEach((line) => auto_log_error(line));
  kolmafiaAbort(lines.join("\n"));
}
