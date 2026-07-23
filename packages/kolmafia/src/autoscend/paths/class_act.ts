import { myPath } from "kolmafia";
import { $path } from "libram";
//Defined in autoscend/paths/class_act.ash
export function in_class_act(): boolean {
  return myPath() === $path`Class Act`;
}
