import { getProperty, Item, itemAmount, Location, Monster, myLocation, toBoolean } from "kolmafia";
import { canSurvive$1 } from "./auto_combat_util";
import { in_lta } from "../paths/license_to_adventure";

//Path specific combat handling for license to adventure

//defined in /autoscend/combat/auto_combat_license_to_adventure.ash
export function auto_combatLicenseToAdventureStage4(round_1: number, enemy: Monster, text: string): string
{
	// stage 4 = prekill. copy, sing along, flyer and other things that need to be done after delevel but before killing
	//each of the 3 items reduces minion count by 3. does NOT auto defeat current minion you are fighting
	if (myLocation() === Location.get("Super Villain's Lair") && in_lta() && canSurvive$1(2.0) && enemy === Monster.get("Villainous Minion"))
	{
		if (!toBoolean(getProperty("_villainLairCanLidUsed")) && itemAmount(Item.get("razor-sharp can lid")) > 0)
		{
			return `item ${Item.get("razor-sharp can lid")}`;
		}
		if (!toBoolean(getProperty("_villainLairWebUsed")) && itemAmount(Item.get("spider web")) > 0)
		{
			return `item ${Item.get("spider web")}`;
		}
		if (!toBoolean(getProperty("_villainLairFirecrackerUsed")) && itemAmount(Item.get("Knob Goblin firecracker")) > 0)
		{
			return `item ${Item.get("Knob Goblin firecracker")}`;
		}
	}

	return "";
}
