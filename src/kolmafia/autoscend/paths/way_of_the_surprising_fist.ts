import { myPath } from "kolmafia";
import { $path } from "libram";
//Defined in autoscend/paths/way_of_the_surprising_fist.ash
export function in_wotsf(): boolean {
  return myPath() === $path`Way of the Surprising Fist`;
}
