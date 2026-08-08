import { myPath } from "kolmafia";
import { $path, set } from "libram";
//Defined in autoscend/paths/fall_of_the_dinosaurs.ash
export function in_disguises(): boolean {
  return myPath() === $path`Disguises Delimit`;
}

export function disguises_initializeSettings(): void {
  if (in_disguises()) {
    set("auto_getBeehive", true);
    set("auto_getBoningKnife", true);
  }
}
