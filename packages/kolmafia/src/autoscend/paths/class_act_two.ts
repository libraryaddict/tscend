import { myPath } from "kolmafia";
import { $path } from "libram";
//Defined in autoscend/paths/class_act_two.ash
export function in_class_act_two(): boolean {
  return myPath() === $path`Class Act II: A Class For Pigs`;
}
