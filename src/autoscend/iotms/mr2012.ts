import { abort, availableAmount, Effect, getProperty, haveEffect, haveSkill, Item, itemAmount, lastMonster, Monster, myLevel, runChoice, setProperty, Skill, toBoolean, toInt, toMonster } from "kolmafia";
import { auto_log_info, handleCopiedMonster } from "../auto_util";

//	This is meant for items that have a date of 2012

//Defined in autoscend/iotms/mr2012.ash
export function auto_reagnimatedGetPart(choice: number): void
{
	if (availableAmount(Item.get("gnomish housemaid's kgnee")) === 0)
	{ // The housemaid's kgnee is the equipment that justified using the gnome.
		runChoice(4);
	}
	else if (availableAmount(Item.get("gnomish coal miner's lung")) === 0)
	{ // May as well get the rest of these on subsequent days.
		runChoice(2);
	}
	else if (availableAmount(Item.get("gnomish athlete's foot")) === 0)
	{
		runChoice(5);
	}
	else if (availableAmount(Item.get("gnomish tennis elbow")) === 0)
	{
		runChoice(3);
	}
	else if (availableAmount(Item.get("gnomish swimmer's ears")) === 0)
	{
		runChoice(1);
	}
	else {
		abort("unhandled choice in auto_reagnimatedGetPart");
	}
}

export function handleRainDoh(): boolean
{
	if (itemAmount(Item.get("Rain-Doh box full of monster")) === 0)
	{
		return false;
	}
	if (myLevel() <= 3)
	{
		return false;
	}
	if (haveEffect(Effect.get("Ultrahydrated")) > 0)
	{
		return false;
	}

	const enemy: Monster = toMonster(getProperty("rainDohMonster"));
	auto_log_info(`Black boxing: ${enemy}`, "blue");

	function validate_rainDohBox(): void
	{
		if (enemy !== Monster.get("Source Agent") && enemy !== lastMonster())
		{ //general failure detection
		//special exclusion for path The Source where [source agent] might randomly replace our target
			abort(`Not sure what exploded. tried to summon copy of ${enemy} but got ${lastMonster()} instead.`);
		}
	}

	if (enemy === Monster.get("lobsterfrogman"))
	{
		if (haveSkill(Skill.get("Rain Man")) && itemAmount(Item.get("barrel of gunpowder")) < 4)
		{
			setProperty("auto_doCombatCopy", "yes");
		}
		handleCopiedMonster(Item.get("Rain-Doh box full of monster"));
		validate_rainDohBox();
		setProperty("auto_doCombatCopy", "no");
		return true;
	}
	if (enemy === Monster.get("Skinflute"))
	{
		const stars: number = itemAmount(Item.get("star"));
		const lines: number = itemAmount(Item.get("line"));

		if (stars < 7 && toBoolean(toInt(lines < 6) & toInt(toInt(getProperty("_raindohCopiesMade")) < 5)))
		{
			setProperty("auto_doCombatCopy", "yes");
		}
		handleCopiedMonster(Item.get("Rain-Doh box full of monster"));
		validate_rainDohBox();
		setProperty("auto_doCombatCopy", "no");
		return true;
	}
	/*	Should we check for an acceptable monster or just empty the box in that case?
	huge swarm of ghuol whelps, modern zmobie, mountain man
	*/
	//If doesn\'t match a special condition
	if (enemy !== Monster.none)
	{
		handleCopiedMonster(Item.get("Rain-Doh box full of monster"));
		validate_rainDohBox();
		return true;
	}

	return false;
}
