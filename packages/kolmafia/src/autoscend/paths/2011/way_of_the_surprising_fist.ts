import { myPath } from "kolmafia";
import { $path } from "libram";

export function in_wotsf(): boolean {
  return myPath() === $path`Way of the Surprising Fist`;
}
