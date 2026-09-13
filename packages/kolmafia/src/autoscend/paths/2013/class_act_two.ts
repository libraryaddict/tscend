import { myPath } from "kolmafia";
import { $path } from "libram";

export function in_class_act_two(): boolean {
  return myPath() === $path`Class Act II: A Class For Pigs`;
}
