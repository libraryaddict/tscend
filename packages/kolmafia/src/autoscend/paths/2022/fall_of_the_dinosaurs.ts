import { myPath } from "kolmafia";
import { $path, set } from "libram";

/* TODO - banishing chickens prior to Nuns
		- wearing chicken hat (and ensuring chickens arent banished) for tower
		- obtaining chicken hat and dino banishing items
		- pheromoning kachungasaurs for nuns
*/

//Defined in autoscend/paths/disguises_delimit.ash
export function in_fotd(): boolean {
  return myPath() === $path`Fall of the Dinosaurs`;
}

export function fotd_initializeSettings(): void {
  if (in_fotd()) {
    set("auto_getBeehive", false); // can birdseed hat the tower monsters
    set("auto_getBoningKnife", false); // can birdseed hat the tower monsters
    set("auto_wandOfNagamar", false); // naughty saursaurus does not need the wand
  }
}
