import { abort, Item, Monster } from "kolmafia";
import { canUse$4, useItem$1 } from "./auto_combat_util";

//Path specific combat handling for Bees Hate You

//defined in /autoscend/combat/auto_combat_bees_hate_you.ash
export function auto_combatBHYStage1(round_1: number, enemy: Monster, text: string): string
{
	// stage 1 = 1st round actions: puzzle boss, pickpocket, duplicate, things that are only allowed if they are the first action you take.
	//Bees Hate You path final boss instakill.
	//technically also a hidden boss in all paths but we never want to fight it in other paths
	if (enemy === Monster.get("Guy Made Of Bees"))
	{
		if (canUse$4(Item.get("antique hand mirror")))
		{
			return useItem$1(Item.get("antique hand mirror"));
		}
		else {
			abort("We attacked [Guy Made Of Bees] without an [antique hand mirror]. Report this then get the mirror before running autoscend again");
		}
	}

	return "";
}