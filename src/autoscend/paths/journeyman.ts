import { myPath, Path } from "kolmafia";

//Defined in autoscend/paths/journeyman.ash
export function in_journeyman(): boolean
{
	return myPath() === Path.get("Journeyman");
}