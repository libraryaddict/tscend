import { myPath } from "kolmafia";
import { $path } from "libram";
//Defined in autoscend/paths/journeyman.ash
export function in_journeyman(): boolean {
  return myPath() === $path`Journeyman`;
}
