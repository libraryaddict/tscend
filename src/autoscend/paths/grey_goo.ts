import { abort, myDaycount, myPath, Path, print } from "kolmafia";

//Defined in autoscend/paths/grey_goo.ash
export function in_ggoo(): boolean
{
	return myPath() === Path.get("Grey Goo");
}

export function LA_grey_goo_tasks(): boolean
{
	if (!in_ggoo())
	{
		return false;
	}

	print("Adventuring in Grey Goo is not currently supported, or necessary. Have fun!");
	if (myDaycount() >= 3)
	{
		print("You made it beyond the dawn of the third day and can now ascend. Congratulations!", "blue");
		abort();
	}
	abort(`Please come back in ${3 - myDaycount()} days.`);
	return true;
}
