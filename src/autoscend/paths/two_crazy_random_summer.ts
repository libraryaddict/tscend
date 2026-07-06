import { abort, cliExecute, haveEffect, Item, mallPrice, maximize, myPath, Path } from "kolmafia";

//Defined in autoscend/paths/two_crazy_random_summer.ash
export function in_tcrs(): boolean
{
	return myPath() === Path.get("Two Crazy Random Summer");
}

export function tcrs_expectedAdvPerFill(quality: string): number
{
	switch (quality)
	{
	case "EPIC":	return 5;
	case "awesome":	return 4;
	case "good":	return 3;
	case "decent":	return 2;
	case "crappy":	return 1;
	default:	abort(`could not calculate expected adventures for quality ${quality} in 2CRS`);
	}
	return -1; // makes the compiler shut up
}

export function tcrs_maximize_with_items(maximizerString: string): boolean
{
	if (!in_tcrs())
	{
		return false;
	}
	// in TCRS, items give random effects. Instead of hard-coding a list of effects for each path/class combination, we look at what we got.
	let used_anything: boolean = false;
	for (const [i, rec] of maximize(maximizerString, 300, 0, true, false).entries())
	{
		if (rec.item !== Item.none && rec.item.fullness === 0 && rec.item.inebriety === 0 && 0 === haveEffect(rec.effect) && mallPrice(rec.item) <= 300 && rec.score > 0.1)
		{ // sometimes maximizer gives spurious results
			cliExecute(rec.command);
			used_anything = true;
		}
	}
	return used_anything;
}