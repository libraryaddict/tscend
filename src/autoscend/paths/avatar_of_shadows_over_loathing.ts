import { Class, cliExecute, getProperty, haveSkill, Item, itemAmount, myClass, myHp, myLevel, myMeat, myPath, Path, setProperty, Skill, toBoolean, toInt, visitUrl } from "kolmafia";
import { auto_log_info$1, meatReserve } from "../auto_util";
import { AshMatcher } from "../utils/kolmafiaUtils";

//Defined in autoscend/paths/avatar_of_shadows_over_loathing.ash
export function in_aosol(): boolean
{
	return myPath() === Path.get("Avatar of Shadows Over Loathing");
}

export function aosol_initializeSettings(): boolean
{
	if (in_aosol())
	{
		setProperty("auto_aosolLastSkill", (0).toString());
		setProperty("auto_wandOfNagamar", false.toString());
		setProperty("auto_aosol_dontUnCurse", true.toString());
	}
	return false;
}

export function aosol_unCurse(): void
{
	//Only care about using these 2 because of the massive weakening they do while Cursed
	//Cursed Blanket is -Fam Weight, but if we are using it for Prismatic Res, we probably don't care about Fam Weight at that time
	//Cursed Arcane Orb is -Item Drop, but if we are using it for Prismatic Dmg, we probably don't care about Item Drop at that time
	//Cursed Dragon Wishbone is -Meat Drop, but if we are using it for Item Drop, we probably don't care about Meat Drop at that time
	if (toBoolean(getProperty("auto_aosol_dontUnCurse"))) { return; }
	if (itemAmount(Item.get("cursed goblin cape")) > 0)
	{ //-15% combat and vulnerability to 2 elements
		visitUrl("inv_use.php?pwd&which=2&whichitem=11149"); //-5% combat after uncursing
		cliExecute("refresh inventory");
	}
	if (itemAmount(Item.get("cursed bat paw")) > 0)
	{ //+ML and -Attributes
		visitUrl("inv_use.php?pwd&which=2&whichitem=11147"); //-25 ML after uncursing
		cliExecute("refresh inventory");
	}
	if (itemAmount(Item.get("cursed stats")) > 0)
	{ //+5 stats but limits stats to NIIIIICCCCEE (69)
		visitUrl("inv_use.php?pwd&which=2&whichitem=11153"); //+1 stat per fight
		cliExecute("refresh inventory");
	}
	if (itemAmount(Item.get("cursed machete")) > 0)
	{ //+50% meat, but cut yourself every turn
		visitUrl("inv_use.php?pwd&which=2&whichitem=11157"); //+20% meat after uncursing
		cliExecute("refresh inventory");
	}
	if (itemAmount(Item.get("cursed medallion")) > 0)
	{ //+100% initiative, but -50% Weapon Dmg and -50% Spell Dmg
		visitUrl("inv_use.php?pwd&which=2&whichitem=11161"); //+25% Initiative after uncursing
		cliExecute("refresh inventory");
	}
}

export function aosol_buySkills(): boolean
{
	if (!in_aosol())
	{
		return false;
	}

	if (toInt(getProperty("auto_aosolLastSkill")) < myLevel())
	{
		if (myClass() === Class.get("Pig Skinner"))
		{
			let page: string = visitUrl("inv_use.php?pwd&which=3&whichitem=11163");
			//Check if there are already skill points
			const my_skillPoints: AshMatcher = new AshMatcher("You have <b>(\\d+)<\\/b> skill", page);
			if (my_skillPoints.find())
			{
				let skillPoints: number = toInt(my_skillPoints.group(1));
				auto_log_info$1(`Skill points found: ${skillPoints}`);
				while (skillPoints > 0)
				{
					if (!haveSkill(Skill.get("[28021]Punt")))
					{ //Banish for the day
						page = visitUrl("choice.php?pwd&option=1&whichchoice=1495&use=points&whichsk=21", true);
					}
					if (!haveSkill(Skill.get("Second Wind")))
					{ //Restore 50% max HP during combat
						page = visitUrl("choice.php?pwd&option=1&whichchoice=1495&use=points&whichsk=16", true);
					}
					if (!haveSkill(Skill.get("Free-For-All")))
					{ //Free kill
						page = visitUrl("choice.php?pwd&option=1&whichchoice=1495&use=points&whichsk=19", true);
					}
					if (!haveSkill(Skill.get("Hot Foot")))
					{ //Deal Mys in Fire Dmg and set enemy on fire
						page = visitUrl("choice.php?pwd&option=1&whichchoice=1495&use=points&whichsk=15", true);
					}
					if (!haveSkill(Skill.get("Competitive Instincts")))
					{ //+100% Meat
						page = visitUrl("choice.php?pwd&option=1&whichchoice=1495&use=points&whichsk=10", true);
					}
					if (!haveSkill(Skill.get("Noogie")))
					{ //Weaken and stun enemy
						page = visitUrl("choice.php?pwd&option=1&whichchoice=1495&use=points&whichsk=14", true);
					}
					if (!haveSkill(Skill.get("Fancy Footwork")))
					{ //25% Item Drops
						page = visitUrl("choice.php?pwd&option=1&whichchoice=1495&use=points&whichsk=6", true);
					}
					if (!haveSkill(Skill.get("Cheerlead")))
					{ //Cheerled (10 advs, +50% all stats)
						page = visitUrl("choice.php?pwd&option=1&whichchoice=1495&use=points&whichsk=18", true);
					}
					if (!haveSkill(Skill.get("Strong Back")))
					{ //Passive Mus +20
						page = visitUrl("choice.php?pwd&option=1&whichchoice=1495&use=points&whichsk=3", true);
					}
					if (!haveSkill(Skill.get("Stop Hitting Yourself")))
					{ //Deal Moxie in phys dmg and stun
						page = visitUrl("choice.php?pwd&option=1&whichchoice=1495&use=points&whichsk=17", true);
					}
					if (!haveSkill(Skill.get("Ripped Triceps")))
					{ //Damaging skills deal 25% more dmg
						page = visitUrl("choice.php?pwd&option=1&whichchoice=1495&use=points&whichsk=8", true);
					}
					skillPoints -= 1;
				}
			}
			//If there are no skill points, we still want to buy skills outright
			if (!haveSkill(Skill.get("Ribald Memories")) && myLevel() >= 1 && myMeat() > 100 + meatReserve())
			{ //passive sleaze res and sleaze dmg
				page = visitUrl("choice.php?pwd&whichchoice=1495&option=1&whichsk=1", true);
				setProperty("auto_aosolLastSkill", (1).toString());
			}
			if (!haveSkill(Skill.get("Blasted Glutes")) && myLevel() >= 2 && myMeat() > 200 + meatReserve())
			{ //max hp +50%
				page = visitUrl("choice.php?pwd&whichchoice=1495&option=1&whichsk=2", true);
				setProperty("auto_aosolLastSkill", (1).toString());
			}
			if (!haveSkill(Skill.get("Stretch")) && myLevel() >= 2 && myMeat() > 200 + meatReserve())
			{ //Stretched (10 advs, +75% Initiative)
				page = visitUrl("choice.php?pwd&whichchoice=1495&option=1&whichsk=12", true);
				setProperty("auto_aosolLastSkill", (2).toString());
			}
			if (!haveSkill(Skill.get("Ball Throw")) && myLevel() >= 3 && myMeat() > 300 + meatReserve())
			{ //Deal your Mus in Phys Dmg
				page = visitUrl("choice.php?pwd&whichchoice=1495&option=1&whichsk=13", true);
				setProperty("auto_aosolLastSkill", (2).toString());
			}
			if (!haveSkill(Skill.get("Strong Back")) && myLevel() >= 3 && myMeat() > 300 + meatReserve())
			{ //Passive Mus +20
				page = visitUrl("choice.php?pwd&whichchoice=1495&option=1&whichsk=3", true);
				setProperty("auto_aosolLastSkill", (3).toString());
			}
			if (!haveSkill(Skill.get("Noogie")) && myLevel() >= 4 && myMeat() > 400 + meatReserve())
			{ //Weaken and stun enemy
				page = visitUrl("choice.php?pwd&whichchoice=1495&option=1&whichsk=14", true);
				setProperty("auto_aosolLastSkill", (3).toString());
			}
			if (!haveSkill(Skill.get("Overconfidence")) && myLevel() >= 4 && myMeat() > 400 + meatReserve())
			{ //+3 Mus Stats per Fight
				page = visitUrl("choice.php?pwd&whichchoice=1495&option=1&whichsk=4", true);
				setProperty("auto_aosolLastSkill", (4).toString());
			}
			if (!haveSkill(Skill.get("Anatomy Expertise")) && myLevel() >= 5 && myMeat() > 500 + meatReserve())
			{ //Damaging skills have chance to double dmg
				page = visitUrl("choice.php?pwd&whichchoice=1495&option=1&whichsk=5", true);
				setProperty("auto_aosolLastSkill", (4).toString());
			}
			if (!haveSkill(Skill.get("Hot Foot")) && myLevel() >= 5 && myMeat() > 500 + meatReserve())
			{ //Deal Mys in Hot Dmg and set enemy on fire
				page = visitUrl("choice.php?pwd&whichchoice=1495&option=1&whichsk=15", true);
				setProperty("auto_aosolLastSkill", (5).toString());
			}
			if (!haveSkill(Skill.get("Fancy Footwork")) && myLevel() >= 6 && myMeat() > 600 + meatReserve())
			{ //25% Item Drops
				page = visitUrl("choice.php?pwd&whichchoice=1495&option=1&whichsk=6", true);
				setProperty("auto_aosolLastSkill", (5).toString());
			}
			if (!haveSkill(Skill.get("Second Wind")) && myLevel() >= 6 && myMeat() > 600 + meatReserve())
			{ //Restore 50% max HP during combat
				page = visitUrl("choice.php?pwd&whichchoice=1495&option=1&whichsk=16", true);
				setProperty("auto_aosolLastSkill", (6).toString());
			}
			if (!haveSkill(Skill.get("Stop Hitting Yourself")) && myLevel() >= 7 && myMeat() > 700 + meatReserve())
			{ //Deal Moxie in phys dmg and stun
				page = visitUrl("choice.php?pwd&whichchoice=1495&option=1&whichsk=17", true);
				setProperty("auto_aosolLastSkill", (6).toString());
			}
			if (!haveSkill(Skill.get("Taut Hamstrings")) && myLevel() >= 7 && myMeat() > 700 + meatReserve())
			{ //Passive +50% Initiative
				page = visitUrl("choice.php?pwd&whichchoice=1495&option=1&whichsk=7", true);
				setProperty("auto_aosolLastSkill", (7).toString());
			}
			if (!haveSkill(Skill.get("Cheerlead")) && myLevel() >= 8 && myMeat() > 800 + meatReserve())
			{ //Cheerled (10 advs, +50% all stats)
				page = visitUrl("choice.php?pwd&whichchoice=1495&option=1&whichsk=18", true);
				setProperty("auto_aosolLastSkill", (7).toString());
			}
			if (!haveSkill(Skill.get("Ripped Triceps")) && myLevel() >= 8 && myMeat() > 800 + meatReserve())
			{ //Damaging skills deal 25% more dmg
				page = visitUrl("choice.php?pwd&whichchoice=1495&option=1&whichsk=8", true);
				setProperty("auto_aosolLastSkill", (8).toString());
			}
			if (!haveSkill(Skill.get("Free-For-All")) && myLevel() >= 9 && myMeat() > 900 + meatReserve())
			{ //Free kill
				page = visitUrl("choice.php?pwd&whichchoice=1495&option=1&whichsk=19", true);
				setProperty("auto_aosolLastSkill", (8).toString());
			}
			if (!haveSkill(Skill.get("Head in the Game")) && myLevel() >= 9 && myMeat() > 900 + meatReserve())
			{ //+50% chance of Crit
				page = visitUrl("choice.php?pwd&whichchoice=1495&option=1&whichsk=9", true);
				setProperty("auto_aosolLastSkill", (9).toString());
			}
			if (!haveSkill(Skill.get("Competitive Instincts")) && myLevel() >= 10 && myMeat() > 1000 + meatReserve())
			{ //+100% Meat
				page = visitUrl("choice.php?pwd&whichchoice=1495&option=1&whichsk=10", true);
				setProperty("auto_aosolLastSkill", (9).toString());
			}
			if (!haveSkill(Skill.get("Tape Up")) && myLevel() >= 10 && myMeat() > 1000 + meatReserve())
			{ //Taped Up (10 advs, +100% Max HP, +100 DA, Regen 8-10 HP)
				page = visitUrl("choice.php?pwd&whichchoice=1495&option=1&whichsk=20", true);
				setProperty("auto_aosolLastSkill", (10).toString());
			}
			if (!haveSkill(Skill.get("Matter Over Mind")) && myLevel() >= 11 && myMeat() > 1100 + meatReserve())
			{ //+25% Max MP
				page = visitUrl("choice.php?pwd&whichchoice=1495&option=1&whichsk=11", true);
				setProperty("auto_aosolLastSkill", (10).toString());
			}
			if (!haveSkill(Skill.get("[28021]Punt")) && myLevel() >= 11 && myMeat() > 1100 + meatReserve())
			{ //Banish for the day
				page = visitUrl("choice.php?pwd&whichchoice=1495&option=1&whichsk=21", true);
				setProperty("auto_aosolLastSkill", (100).toString());
			}
		}
		if (myClass() === Class.get("Cheese Wizard"))
		{
			let page: string = visitUrl("inv_use.php?pwd&which=3&whichitem=11164");
			//Check if there are already skill points
			const my_skillPoints: AshMatcher = new AshMatcher("You have <b>(\\d+)<\\/b> skill", page);
			if (my_skillPoints.find())
			{
				let skillPoints: number = toInt(my_skillPoints.group(1));
				auto_log_info$1(`Skill points found: ${skillPoints}`);
				while (skillPoints > 0)
				{
					if (!haveSkill(Skill.get("Fondeluge")))
					{ //50 turn yellow ray
						page = visitUrl("choice.php?pwd&whichchoice=1495&option=1&use=points&whichsk=21", true);
					}
					if (!haveSkill(Skill.get("Emmental Elemental")))
					{ //Deal Moxie in cold dmg and heal for same amt
						page = visitUrl("choice.php?pwd&whichchoice=1495&option=1&use=points&whichsk=17", true);
					}
					if (!haveSkill(Skill.get("Peccorino Bravado")))
					{ //+20% all stats
						page = visitUrl("choice.php?pwd&whichchoice=1495&option=1&use=points&whichsk=6", true);
					}
					if (!haveSkill(Skill.get("Fingers of Fontina")))
					{ //+50% item drops
						page = visitUrl("choice.php?pwd&whichchoice=1495&option=1&use=points&whichsk=11", true);
					}
					if (!haveSkill(Skill.get("Quick Wit")))
					{ //Passive Mys +20
						page = visitUrl("choice.php?pwd&whichchoice=1495&option=1&use=points&whichsk=3", true);
					}
					if (!haveSkill(Skill.get("Gather Cheese-Chi")))
					{ //Heal +30HP and stun enemy
						page = visitUrl("choice.php?pwd&whichchoice=1495&option=1&use=points&whichsk=14", true);
					}
					if (!haveSkill(Skill.get("Mind Melt")))
					{ //Deal your Mys in hot damage and stun enemy
						page = visitUrl("choice.php?pwd&whichchoice=1495&option=1&use=points&whichsk=16", true);
					}
					if (!haveSkill(Skill.get("Crack Knuckles")))
					{ //Deal Mus in phys Dmg and weaken enemy
						page = visitUrl("choice.php?pwd&whichchoice=1495&option=1&use=points&whichsk=15", true);
					}
					if (!haveSkill(Skill.get("Stilton Splatter")))
					{ //Deal mys in phys dmg and +fam exp
						page = visitUrl("choice.php?pwd&whichchoice=1495&option=1&use=points&whichsk=19", true);
					}
					if (!haveSkill(Skill.get("Bleu Brilliance")))
					{ //Cheese spells deal 50% more damage
						page = visitUrl("choice.php?pwd&whichchoice=1495&option=1&use=points&whichsk=8", true);
					}
					if (!haveSkill(Skill.get("Gorgonzola's Guile")))
					{ //+25% Item Drops
						page = visitUrl("choice.php?pwd&whichchoice=1495&option=1&use=points&whichsk=9", true);
					}
					skillPoints -= 1;
				}
			}
			//If there are no skill points, we still want to buy skills outright
			if (!haveSkill(Skill.get("Mind Over Muenster")) && myLevel() >= 1 && myMeat() > 100 + meatReserve())
			{ //max mp +30%, regen 3-4 mp per adv
				page = visitUrl("choice.php?pwd&whichchoice=1495&option=1&whichsk=1", true);
				setProperty("auto_aosolLastSkill", (1).toString());
			}
			if (!haveSkill(Skill.get("Cheddarmor")) && myLevel() >= 2 && myMeat() > 200 + meatReserve())
			{ //Cheddarmored (10 advs, +10 max HP, +50 DA, +3 DR)
				page = visitUrl("choice.php?pwd&whichchoice=1495&option=1&whichsk=12", true);
				setProperty("auto_aosolLastSkill", (1).toString());
			}
			if (!haveSkill(Skill.get("Subcutaneous Gouda")) && myLevel() >= 2 && myMeat() > 200 + meatReserve())
			{ //passive DA +75, DR +5
				page = visitUrl("choice.php?pwd&whichchoice=1495&option=1&whichsk=2", true);
				setProperty("auto_aosolLastSkill", (2).toString());
			}
			if (!haveSkill(Skill.get("Parmesan Missile")) && myLevel() >= 3 && myMeat() > 300 + meatReserve())
			{ //Deal your Mys in Stench, Hot, or Phys Dmg
				page = visitUrl("choice.php?pwd&whichchoice=1495&option=1&whichsk=13", true);
				setProperty("auto_aosolLastSkill", (2).toString());
			}
			if (!haveSkill(Skill.get("Quick Wit")) && myLevel() >= 3 && myMeat() > 300 + meatReserve())
			{ //Passive Mys +20
				page = visitUrl("choice.php?pwd&whichchoice=1495&option=1&whichsk=3", true);
				setProperty("auto_aosolLastSkill", (3).toString());
			}
			if (!haveSkill(Skill.get("Gather Cheese-Chi")) && myLevel() >= 4 && myMeat() > 400 + meatReserve())
			{ //Heal +30HP and stun enemy
				page = visitUrl("choice.php?pwd&whichchoice=1495&option=1&whichsk=14", true);
				setProperty("auto_aosolLastSkill", (3).toString());
			}
			if (!haveSkill(Skill.get("Limberger Limberness")) && myLevel() >= 4 && myMeat() > 400 + meatReserve())
			{ //Passive +75% Initiative
				page = visitUrl("choice.php?pwd&whichchoice=1495&option=1&whichsk=4", true);
				setProperty("auto_aosolLastSkill", (4).toString());
			}
			if (!haveSkill(Skill.get("Swiss Cunning")) && myLevel() >= 5 && myMeat() > 500 + meatReserve())
			{ //-3mp to use skills
				page = visitUrl("choice.php?pwd&whichchoice=1495&option=1&whichsk=5", true);
				setProperty("auto_aosolLastSkill", (4).toString());
			}
			if (!haveSkill(Skill.get("Crack Knuckles")) && myLevel() >= 5 && myMeat() > 500 + meatReserve())
			{ //Deal Mus in phys Dmg and weaken enemy
				page = visitUrl("choice.php?pwd&whichchoice=1495&option=1&whichsk=15", true);
				setProperty("auto_aosolLastSkill", (5).toString());
			}
			if (!haveSkill(Skill.get("Peccorino Bravado")) && myLevel() >= 6 && myMeat() > 600 + meatReserve())
			{ //+20% all stats
				page = visitUrl("choice.php?pwd&whichchoice=1495&option=1&whichsk=6", true);
				setProperty("auto_aosolLastSkill", (5).toString());
			}
			if (!haveSkill(Skill.get("Mind Melt")) && myLevel() >= 6 && myMeat() > 600 + meatReserve())
			{ //Deal your Mys in hot damage and stun enemy
				page = visitUrl("choice.php?pwd&whichchoice=1495&option=1&whichsk=16", true);
				setProperty("auto_aosolLastSkill", (6).toString());
			}
			if (!haveSkill(Skill.get("Emmental Elemental")) && myLevel() >= 7 && myMeat() > 700 + meatReserve())
			{ //Deal Moxie in cold dmg and heal for same amt
				page = visitUrl("choice.php?pwd&whichchoice=1495&option=1&whichsk=17", true);
				setProperty("auto_aosolLastSkill", (6).toString());
			}
			if (!haveSkill(Skill.get("Wisdom of Jarlsberg")) && myLevel() >= 7 && myMeat() > 700 + meatReserve())
			{ //+3 Mys stats per fight
				page = visitUrl("choice.php?pwd&whichchoice=1495&option=1&whichsk=7", true);
				setProperty("auto_aosolLastSkill", (7).toString());
			}
			if (!haveSkill(Skill.get("Reality Shift")) && myLevel() >= 8 && myMeat() > 800 + meatReserve())
			{ //Shifted Reality (10 advs, +3 prismatic res)
				page = visitUrl("choice.php?pwd&whichchoice=1495&option=1&whichsk=18", true);
				setProperty("auto_aosolLastSkill", (7).toString());
			}
			if (!haveSkill(Skill.get("Bleu Brilliance")) && myLevel() >= 8 && myMeat() > 800 + meatReserve())
			{ //Cheese spells deal 50% more damage
				page = visitUrl("choice.php?pwd&whichchoice=1495&option=1&whichsk=8", true);
				setProperty("auto_aosolLastSkill", (8).toString());
			}
			if (!haveSkill(Skill.get("Stilton Splatter")) && myLevel() >= 9 && myMeat() > 900 + meatReserve())
			{ //Deal mys in phys dmg and +fam exp
				page = visitUrl("choice.php?pwd&whichchoice=1495&option=1&whichsk=19", true);
				setProperty("auto_aosolLastSkill", (8).toString());
			}
			if (!haveSkill(Skill.get("Gorgonzola's Guile")) && myLevel() >= 9 && myMeat() > 900 + meatReserve())
			{ //+25% Item Drops
				page = visitUrl("choice.php?pwd&whichchoice=1495&option=1&whichsk=9", true);
				setProperty("auto_aosolLastSkill", (9).toString());
			}
			if (!haveSkill(Skill.get("Medical Manchego")) && myLevel() >= 10 && myMeat() > 1000 + meatReserve())
			{ //passive +20% max HP, regen 3-5 HP per adv
				page = visitUrl("choice.php?pwd&whichchoice=1495&option=1&whichsk=10", true);
				setProperty("auto_aosolLastSkill", (9).toString());
			}
			if (!haveSkill(Skill.get("Queso Fustulento")) && myLevel() >= 10 && myMeat() > 1000 + meatReserve())
			{ //Queso Fustulento (10 advs, Stench dmg each round)
				page = visitUrl("choice.php?pwd&whichchoice=1495&option=1&whichsk=20", true);
				setProperty("auto_aosolLastSkill", (10).toString());
			}
			if (!haveSkill(Skill.get("Fingers of Fontina")) && myLevel() >= 11 && myMeat() > 1100 + meatReserve())
			{ //+50% item drops
				page = visitUrl("choice.php?pwd&whichchoice=1495&option=1&whichsk=11", true);
				setProperty("auto_aosolLastSkill", (10).toString());
			}
			if (!haveSkill(Skill.get("Fondeluge")) && myLevel() >= 11 && myMeat() > 1100 + meatReserve())
			{ //50 turn yellow ray
				page = visitUrl("choice.php?pwd&whichchoice=1495&option=1&whichsk=21", true);
				setProperty("auto_aosolLastSkill", (100).toString());
			}
		}
		if (myClass() === Class.get("Jazz Agent"))
		{
			let page: string = visitUrl("inv_use.php?pwd&which=3&whichitem=11165");
			//Check if there are already skill points
			const my_skillPoints: AshMatcher = new AshMatcher("You have <b>(\\d+)<\\/b> skill", page);
			if (my_skillPoints.find())
			{
				let skillPoints: number = toInt(my_skillPoints.group(1));
				auto_log_info$1(`Skill points found: ${skillPoints}`);
				while (skillPoints > 0)
				{
					if (!haveSkill(Skill.get("Motif")))
					{ //25 turn blue ray (olfaction-esque)
						page = visitUrl("choice.php?pwd&whichchoice=1495&option=1&use=points&whichsk=21", true);
					}
					if (!haveSkill(Skill.get("Air of Mystery")))
					{ //First attack against you always misses
						page = visitUrl("choice.php?pwd&whichchoice=1495&option=1&use=points&whichsk=6", true);
					}
					if (!haveSkill(Skill.get("Sax of Violence")))
					{ //Deal Mus in Sleaze dmg
						page = visitUrl("choice.php?pwd&whichchoice=1495&option=1&use=points&whichsk=17", true);
					}
					if (!haveSkill(Skill.get("Drum Roll")))
					{ //Stun enemy for a few rounds
						page = visitUrl("choice.php?pwd&whichchoice=1495&option=1&use=points&whichsk=16", true);
					}
					if (!haveSkill(Skill.get("C Sharp Eyes")))
					{ //+50% item drop, +50% meat drop
						page = visitUrl("choice.php?pwd&whichchoice=1495&option=1&use=points&whichsk=5", true);
					}
					if (!haveSkill(Skill.get("Fashion Sense")))
					{ //Mox +20
						page = visitUrl("choice.php?pwd&whichchoice=1495&option=1&use=points&whichsk=3", true);
					}
					if (!haveSkill(Skill.get("Knife In The Darkness")))
					{ //Deal 50% of your foe's HP and gives 10 adv In The Darkness (-10% combat)
						page = visitUrl("choice.php?pwd&whichchoice=1495&option=1&use=points&whichsk=14", true);
					}
					if (!haveSkill(Skill.get("Orchestra Strike")))
					{ //Deal your Mox in Phys Dmg, Weaken Enemy
						page = visitUrl("choice.php?pwd&whichchoice=1495&option=1&use=points&whichsk=13", true);
					}
					if (!haveSkill(Skill.get("Venomous Riff")))
					{ //Deal Mys in dmg and poison foe
						page = visitUrl("choice.php?pwd&whichchoice=1495&option=1&use=points&whichsk=15", true);
					}
					if (!haveSkill(Skill.get("Grit Teeth")))
					{ //In combat 20 HP heal
						page = visitUrl("choice.php?pwd&whichchoice=1495&option=1&use=points&whichsk=19", true);
					}
					if (!haveSkill(Skill.get("Perfect Embouchure")))
					{ //Musical skills deal 33% more damage
						page = visitUrl("choice.php?pwd&whichchoice=1495&option=1&use=points&whichsk=8", true);
					}
					skillPoints -= 1;
				}
			}
			//If there are no skill points, we still want to buy skills outright
			if (!haveSkill(Skill.get("Thick Calluses")) && myLevel() >= 1 && myMeat() > 100 + meatReserve())
			{ //DA +50, DR +3
				page = visitUrl("choice.php?pwd&whichchoice=1495&option=1&whichsk=1", true);
				setProperty("auto_aosolLastSkill", (1).toString());
			}
			if (!haveSkill(Skill.get("Call For Backup")) && myLevel() >= 2 && myMeat() > 200 + meatReserve())
			{ //Reliable Backup (10 advs, +10 Fam Weight, Familiar acts more often)
				page = visitUrl("choice.php?pwd&whichchoice=1495&option=1&whichsk=12", true);
				setProperty("auto_aosolLastSkill", (1).toString());
			}
			if (!haveSkill(Skill.get("Virtuosity")) && myLevel() >= 2 && myMeat() > 200 + meatReserve())
			{ //+3 Moxie Stats per fight
				page = visitUrl("choice.php?pwd&whichchoice=1495&option=1&whichsk=10", true);
				setProperty("auto_aosolLastSkill", (2).toString());
			}
			if (!haveSkill(Skill.get("Orchestra Strike")) && myLevel() >= 3 && myMeat() > 300 + meatReserve())
			{ //Deal your Mox in Phys Dmg, Weaken Enemy
				page = visitUrl("choice.php?pwd&whichchoice=1495&option=1&whichsk=13", true);
				setProperty("auto_aosolLastSkill", (2).toString());
			}
			if (!haveSkill(Skill.get("Fashion Sense")) && myLevel() >= 3 && myMeat() > 300 + meatReserve())
			{ //Mox +20
				page = visitUrl("choice.php?pwd&whichchoice=1495&option=1&whichsk=3", true);
				setProperty("auto_aosolLastSkill", (3).toString());
			}
			if (!haveSkill(Skill.get("Knife In The Darkness")) && myLevel() >= 4 && myMeat() > 400 + meatReserve())
			{ //Deal 50% of your foe's HP and gives 10 adv In The Darkness (-10% combat)
				page = visitUrl("choice.php?pwd&whichchoice=1495&option=1&whichsk=14", true);
				setProperty("auto_aosolLastSkill", (3).toString());
			}
			if (!haveSkill(Skill.get("Jazz Hands")) && myLevel() >= 4 && myMeat() > 400 + meatReserve())
			{ //Regen 4-5 mp per adv
				page = visitUrl("choice.php?pwd&whichchoice=1495&option=1&whichsk=4", true);
				setProperty("auto_aosolLastSkill", (4).toString());
			}
			if (!haveSkill(Skill.get("C Sharp Eyes")) && myLevel() >= 5 && myMeat() > 500 + meatReserve())
			{ //+50% item drop, +50% meat drop
				page = visitUrl("choice.php?pwd&whichchoice=1495&option=1&whichsk=5", true);
				setProperty("auto_aosolLastSkill", (4).toString());
			}
			if (!haveSkill(Skill.get("Venomous Riff")) && myLevel() >= 5 && myMeat() > 500 + meatReserve())
			{ //Deal Mys in dmg and poison foe
				page = visitUrl("choice.php?pwd&whichchoice=1495&option=1&whichsk=15", true);
				setProperty("auto_aosolLastSkill", (5).toString());
			}
			if (!haveSkill(Skill.get("Air of Mystery")) && myLevel() >= 6 && myMeat() > 600 + meatReserve())
			{ //First attack against you always misses
				page = visitUrl("choice.php?pwd&whichchoice=1495&option=1&whichsk=6", true);
				setProperty("auto_aosolLastSkill", (5).toString());
			}
			if (!haveSkill(Skill.get("Drum Roll")) && myLevel() >= 6 && myMeat() > 600 + meatReserve())
			{ //Stun enemy for a few rounds
				page = visitUrl("choice.php?pwd&whichchoice=1495&option=1&whichsk=16", true);
				setProperty("auto_aosolLastSkill", (6).toString());
			}
			if (!haveSkill(Skill.get("Sax of Violence")) && myLevel() >= 7 && myMeat() > 700 + meatReserve())
			{ //Deal Mus in Sleaze dmg
				page = visitUrl("choice.php?pwd&whichchoice=1495&option=1&whichsk=17", true);
				setProperty("auto_aosolLastSkill", (6).toString());
			}
			if (!haveSkill(Skill.get("Rhythmic Precision")) && myLevel() >= 7 && myMeat() > 700 + meatReserve())
			{ //-3 MP to use skills
				page = visitUrl("choice.php?pwd&whichchoice=1495&option=1&whichsk=7", true);
				setProperty("auto_aosolLastSkill", (7).toString());
			}
			if (!haveSkill(Skill.get("Tricky Timpani")) && myLevel() >= 8 && myMeat() > 800 + meatReserve())
			{ //Tricky Timpani (10 advs, +5 prismatic dmg)
				page = visitUrl("choice.php?pwd&whichchoice=1495&option=1&whichsk=18", true);
				setProperty("auto_aosolLastSkill", (7).toString());
			}
			if (!haveSkill(Skill.get("Perfect Embouchure")) && myLevel() >= 8 && myMeat() > 800 + meatReserve())
			{ //Musical skills deal 33% more damage
				page = visitUrl("choice.php?pwd&whichchoice=1495&option=1&whichsk=8", true);
				setProperty("auto_aosolLastSkill", (8).toString());
			}
			if (!haveSkill(Skill.get("Grit Teeth")) && myLevel() >= 9 && myMeat() > 900 + meatReserve())
			{ //In combat 20 HP heal
				page = visitUrl("choice.php?pwd&whichchoice=1495&option=1&whichsk=19", true);
				setProperty("auto_aosolLastSkill", (8).toString());
			}
			if (!haveSkill(Skill.get("Improv Muscles")) && myLevel() >= 9 && myMeat() > 900 + meatReserve())
			{ //+25% Max HP, +25% Initiatve
				page = visitUrl("choice.php?pwd&whichchoice=1495&option=1&whichsk=9", true);
				setProperty("auto_aosolLastSkill", (9).toString());
			}
			if (!haveSkill(Skill.get("Impeccable Timing")) && myLevel() >= 10 && myMeat() > 1000 + meatReserve())
			{ //passive +100% combat initiative
				page = visitUrl("choice.php?pwd&whichchoice=1495&option=1&whichsk=2", true);
				setProperty("auto_aosolLastSkill", (9).toString());
			}
			if (!haveSkill(Skill.get("Soothing Flute")) && myLevel() >= 10 && myMeat() > 1000 + meatReserve())
			{ //Soothing Flute (10 advs, +5 fam weight, regen 8-10 hp per adv)
				page = visitUrl("choice.php?pwd&whichchoice=1495&option=1&whichsk=20", true);
				setProperty("auto_aosolLastSkill", (10).toString());
			}
			if (!haveSkill(Skill.get("Rhythm In Your Blood")) && myLevel() >= 11 && myMeat() > 1100 + meatReserve())
			{ //+20% Max HP
				page = visitUrl("choice.php?pwd&whichchoice=1495&option=1&whichsk=11", true);
				setProperty("auto_aosolLastSkill", (10).toString());
			}
			if (!haveSkill(Skill.get("Motif")) && myLevel() >= 11 && myMeat() > 1100 + meatReserve())
			{ //25 turn blue ray (olfaction-esque)
				page = visitUrl("choice.php?pwd&whichchoice=1495&option=1&whichsk=21", true);
				setProperty("auto_aosolLastSkill", (100).toString());
			}
		}
	}
	else {
		return false;
	}

	return false;
}
//Breaking the auto-restore code so that we can heal in-combat instead of before combat
//These are only called in auto_restore if the player has the in-combat heals for a given class
//The code might not be 100% correct but they do what they were programmed to do, so c'est la vie.
export function auto_pigSkinnerAcquireHP(goal: number): boolean
{
	while (myHp() < goal)
	{
		break;
	}
	return goal >= myHp();
}
export function auto_cheeseWizardAcquireHP(goal: number): boolean
{
	while (myHp() < goal)
	{
		break;
	}
	return goal >= myHp();
}
export function auto_jazzAgentAcquireHP(goal: number): boolean
{
	while (myHp() < goal)
	{
		break;
	}
	return goal >= myHp();
}
