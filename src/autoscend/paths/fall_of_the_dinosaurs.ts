import { Path, myPath, runChoice, setProperty, visitUrl } from "kolmafia";
import { AshMatcher } from "../utils/kolmafiaUtils";

/* TODO - banishing chickens prior to Nuns
		- wearing chicken hat (and ensuring chickens arent banished) for tower
		- obtaining chicken hat and dino banishing items
		- pheromoning kachungasaurs for nuns
*/


//Defined in autoscend/paths/disguises_delimit.ash
export function in_fotd(): boolean
{
	return myPath() === Path.get("Fall of the Dinosaurs");
}

export function fotd_initializeSettings(): void
{
	if (in_fotd())
	{
		setProperty("auto_getBeehive", false.toString()); // can birdseed hat the tower monsters
		setProperty("auto_getBoningKnife", false.toString()); // can birdseed hat the tower monsters
		setProperty("auto_wandOfNagamar", false.toString()); // naughty saursaurus does not need the wand
	}
}

function fotd_gameWarden(): boolean
{
	if (!in_fotd())
	{
		return false;
	}
	let warden: string = visitUrl("place.php?whichplace=dinorf&action=dinorf_hunter");
	let target: AshMatcher = new AshMatcher("what I need is ([0-9])+ ([A-Za-z ])+\"", warden); // TODO add some logic meaning we only check at start of day and then once we know we have enough of the target item?
	let can_collect: AshMatcher = new AshMatcher("Looks like you have [0-9]+. Want", warden);

	while (can_collect.find())
	{
		warden = runChoice(1);
	}

	runChoice(2);
	return true;
}
