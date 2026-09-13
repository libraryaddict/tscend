import { myPath } from "kolmafia";
import { $path } from "libram";

export function in_class_act(): boolean {
  return myPath() === $path`Class Act`;
}
