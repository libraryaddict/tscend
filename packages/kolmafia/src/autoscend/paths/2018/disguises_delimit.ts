import { myPath } from "kolmafia";
import { $path, set } from "libram";

export function in_disguises(): boolean {
  return myPath() === $path`Disguises Delimit`;
}

export function disguises_initializeSettings(): void {
  if (in_disguises()) {
    set("tscend_getBeehive", true);
    set("tscend_getBoningKnife", true);
  }
}
