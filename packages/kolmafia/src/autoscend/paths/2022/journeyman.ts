import { myPath } from "kolmafia";
import { $path } from "libram";

export function in_journeyman(): boolean {
  return myPath() === $path`Journeyman`;
}
