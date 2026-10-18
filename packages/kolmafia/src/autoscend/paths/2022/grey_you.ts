import { myPath } from "kolmafia";
import { $path } from "libram";

export function in_gyou(): boolean {
  return myPath() === $path`Grey You`;
}
