import { Item, containsText, isUnrestricted, visitUrl } from "kolmafia";

//Defined in autoscend/iotms/auto_eudora.ash
export function eudora_available(): boolean
{
	if (containsText(visitUrl("account.php"), "tab=correspondence"))
	{
		return true;
	}
	return false;
}

export function eudora_initializeSettings(): Map<Item, boolean>
{
	let retval: Map<Item, boolean> = new Map();
	if (eudora_available())
	{
		let eudora_1: string = visitUrl("account.php?tab=correspondence");
		if (containsText(eudora_1, "Pen Pal") && isUnrestricted(Item.get("My Own Pen Pal kit")))
		{
			retval.set(Item.get("My Own Pen Pal kit"), true);
		}
		if (containsText(eudora_1, "GameInformPowerDailyPro Magazine") && isUnrestricted(Item.get("GameInformPowerDailyPro subscription card")))
		{
			retval.set(Item.get("GameInformPowerDailyPro subscription card"), true);
		}
		if (containsText(eudora_1, "Xi Receiver Unit") && isUnrestricted(Item.get("Xi Receiver Unit")))
		{
			retval.set(Item.get("Xi Receiver Unit"), true);
		}
		if (containsText(eudora_1, "New-You Club") && isUnrestricted(Item.get("New-You Club Membership Form")))
		{
			retval.set(Item.get("New-You Club Membership Form"), true);
		}
		if (containsText(eudora_1, "Our Daily Candles") && isUnrestricted(Item.get("Our Daily Candles&trade; order form")))
		{
			retval.set(Item.get("Our Daily Candles&trade; order form"), true);
		}
	}
	return retval;
}

export function eudora_current(): Item
{
	if (eudora_available())
	{
		let eudora_1: string = visitUrl("account.php?tab=correspondence");
		if (containsText(eudora_1, "selected' value=\"1") && isUnrestricted(Item.get("My Own Pen Pal kit")))
		{
			return Item.get("My Own Pen Pal kit");
		}
		if (containsText(eudora_1, "selected' value=\"2") && isUnrestricted(Item.get("GameInformPowerDailyPro subscription card")))
		{
			return Item.get("GameInformPowerDailyPro subscription card");
		}
		if (containsText(eudora_1, "selected' value=\"3") && isUnrestricted(Item.get("Xi Receiver Unit")))
		{
			return Item.get("Xi Receiver Unit");
		}
		if (containsText(eudora_1, "selected' value=\"4") && isUnrestricted(Item.get("New-You Club Membership Form")))
		{
			return Item.get("New-You Club Membership Form");
		}
		if (containsText(eudora_1, "selected' value=\"5") && isUnrestricted(Item.get("Our Daily Candles&trade; order form")))
		{
			return Item.get("Our Daily Candles&trade; order form");
		}
	}
	return Item.none;
}