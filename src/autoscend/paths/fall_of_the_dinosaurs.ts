import { myPath, setProperty } from "kolmafia";
import { $path } from "libram";

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
    setProperty("auto_getBeehive", false.toString()); // can birdseed hat the tower monsters
    setProperty("auto_getBoningKnife", false.toString()); // can birdseed hat the tower monsters
    setProperty("auto_wandOfNagamar", false.toString()); // naughty saursaurus does not need the wand
  }
}
