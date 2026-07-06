import { Item, alliedRadio, containsText, getProperty, isUnrestricted, itemAmount, min, myLevel, toBoolean, toInt, use, visitUrl } from "kolmafia";
import { possessEquipment } from "../auto_equipment";
import { auto_is_valid, handleTracker$1, internalQuestStatus } from "../auto_util";
import { in_hattrick } from "../paths/hattrick";
import { in_zootomist } from "../paths/zootomist";

//Defined in autoscend/iotms/ttt.ash
function eudora_xiblaxian(): Map<Item, number>
{
	let retval: Map<Item, number> = new Map();
	if (itemAmount(Item.get("Xiblaxian 5D printer")) > 0 && isUnrestricted(Item.get("Xiblaxian 5D printer")))
	{
		let canMake: string = visitUrl("shop.php?whichshop=5dprinter");
		let polymer: number = itemAmount(Item.get("Xiblaxian polymer"));
		let crystal: number = itemAmount(Item.get("Xiblaxian crystal"));
		let circuitry: number = itemAmount(Item.get("Xiblaxian circuitry"));
		let alloy: number = itemAmount(Item.get("Xiblaxian alloy"));
		if (containsText(canMake, "Xiblaxian xeno-detection goggles"))
		{
			retval.set(Item.get("Xiblaxian xeno-detection goggles"), min(polymer / 4, crystal / 2));
		}
		if (containsText(canMake, "Xiblaxian stealth cowl") && !in_hattrick())
		{
			retval.set(Item.get("Xiblaxian stealth cowl"), min(circuitry / 4, min(polymer / 9, alloy / 5)));
		}
		if (containsText(canMake, "Xiblaxian stealth trousers"))
		{
			retval.set(Item.get("Xiblaxian stealth trousers"), min(circuitry / 9, min(polymer / 4, alloy / 5)));
		}
		if (containsText(canMake, "Xiblaxian stealth vest"))
		{
			retval.set(Item.get("Xiblaxian stealth vest"), min(circuitry / 5, min(polymer / 4, alloy / 9)));
		}
		if (containsText(canMake, "Xiblaxian ultraburrito"))
		{
			retval.set(Item.get("Xiblaxian ultraburrito"), min(circuitry / 1, min(polymer / 1, alloy / 3)));
		}
		if (containsText(canMake, "Xiblaxian space-whiskey"))
		{
			retval.set(Item.get("Xiblaxian space-whiskey"), min(circuitry / 3, min(polymer / 1, alloy / 1)));
		}
		if (containsText(canMake, "Xiblaxian residence-cube"))
		{
			retval.set(Item.get("Xiblaxian residence-cube"), min(min(circuitry / 11, crystal / 3), min(polymer / 11, alloy / 11)));
		}
	}
	return retval;
}

export function auto_useWardrobe(): void
{
	if (!auto_is_valid(Item.get("wardrobe-o-matic")))
	{
		return;
	}
	if (itemAmount(Item.get("wardrobe-o-matic")) === 0)
	{
		return;
	}
	// check one of the 3 prefs which get set when wardrobe is used each day
	if (getProperty("_futuristicHatModifier") !== "")
	{
		return;
	}
	// wait for level 5 to get an upgraded wardrobe
	if (myLevel() < 5)
	{
		return;
	}
	// Zooto will be at 10 in very few turns
	if (myLevel() < 10 && in_zootomist())
	{
		return;
	}
	// wait for level 15 if close and not at NS tower
	if (myLevel() === 14 && internalQuestStatus("questL13Final") < 0)
	{
		return;
	}
	// only need to use it so we get the hat, shirt, fam equip
	// let maximizer handle if any of it is worth equipping
	use(Item.get("wardrobe-o-matic"));
}

export function auto_haveARB(): boolean
{
    return possessEquipment(Item.get("Allied Radio Backpack")) && auto_is_valid(Item.get("Allied Radio Backpack"));
}

export function auto_canARBSupplyDrop(): boolean
{
    return auto_ARBSupplyDropsLeft() > 0;
}

export function auto_ARBSupplyDropsLeft(): number
{
    if (!auto_is_valid(Item.get("Allied Radio Backpack")))
    {
        return 0;
    }
    let n_backpack_left: number = (auto_haveARB() ? 3 - toInt(getProperty("_alliedRadioDropsUsed")) : 0);
    return n_backpack_left + itemAmount(Item.get("handheld Allied radio"));
}

export function ARBSupplyDrop(req: string): boolean
{
    if (!auto_canARBSupplyDrop())
    {
        return false;
    }
    let radio: string = "";
    switch (req)
    {
        case "non-combat":
        case "nc":
        case "sniper support":
            radio = "sniper support";
            break;
        case "item drop":
        case "item":
        case "materiel intel":
            if (toBoolean(getProperty("_alliedRadioMaterielIntel")))
            {
                return false;
            }
            radio = "materiel intel";
            break;
        case "res":
        case "wsb":
            if (toBoolean(getProperty("_alliedRadioWildsunBoon")))
            {
                return false;
            }
            radio = "wildsun boon";
            break;
        case "food":
        case "rations":
            radio = "rations";
            break;
        case "drink":
        case "fuel":
            radio = "fuel";
            break;
        case "ellipsoidtine":
            radio = "ellipsoidtine";
            break;
        case "radio":
        default:
            radio = "radio";
            break;
    }
    if (alliedRadio(radio))
    {
        handleTracker$1(Item.get("Allied Radio Backpack").toString(), radio, "auto_iotm_claim");
        return true;
    }

    return false;
}