import { myPath, setProperty } from "kolmafia";
import { $path } from "libram";
//Defined in autoscend/paths/fall_of_the_dinosaurs.ash
export function in_disguises(): boolean {
  return myPath() === $path`Disguises Delimit`;
}

export function disguises_initializeSettings(): void {
  if (in_disguises()) {
    setProperty("auto_getBeehive", true.toString());
    setProperty("auto_getBoningKnife", true.toString());
  }
}
