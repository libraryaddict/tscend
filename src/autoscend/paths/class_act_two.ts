import { myPath, Path } from "kolmafia";

//Defined in autoscend/paths/class_act_two.ash
export function in_class_act_two(): boolean
{
	return myPath() === Path.get("Class Act II: A Class For Pigs");
}