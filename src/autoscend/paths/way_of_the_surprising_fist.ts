import { myPath, Path } from "kolmafia";

//Defined in autoscend/paths/way_of_the_surprising_fist.ash
export function in_wotsf(): boolean
{
	return myPath() === Path.get("Way of the Surprising Fist");
}
