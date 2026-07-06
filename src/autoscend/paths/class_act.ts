import { myPath, Path } from "kolmafia";

//Defined in autoscend/paths/class_act.ash
export function in_class_act(): boolean
{
	return myPath() === Path.get("Class Act");
}