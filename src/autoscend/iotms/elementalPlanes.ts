import { Element, getProperty, indexOf, isUnrestricted, Item, toBoolean, visitUrl } from "kolmafia";
import { auto_log_info } from "../auto_util";
import { AshMatcher } from "../utils/kolmafiaUtils";

//Defined in autoscend/iotms/auto_elementalPlanes.ash
function getCharterIndexable(): Map<Element, Item>
{
	const charters: Map<Element, Item> = new Map();
	charters.set(Element.get("cold"), Item.get("airplane charter: The Glaciest"));
	charters.set(Element.get("hot"), Item.get("airplane charter: That 70s Volcano"));
	charters.set(Element.get("sleaze"), Item.get("airplane charter: Spring Break Beach"));
	charters.set(Element.get("spooky"), Item.get("airplane charter: Conspiracy Island"));
	charters.set(Element.get("stench"), Item.get("airplane charter: Dinseylandfill"));
	return charters;
}

export function elementalPlanes_access(ele: Element): boolean
{
	const charters: Map<Element, Item> = getCharterIndexable();
	return toBoolean(getProperty(`${ele}AirportAlways`)) && isUnrestricted((charters.get(ele) ?? charters.set(ele, Item.none).get(ele)));
}

export function elementalPlanes_takeJob(ele: Element): boolean
{
	if (!elementalPlanes_access(ele))
	{
		return false;
	}

	if (ele === Element.get("spooky") && elementalPlanes_access(ele))
	{
		visitUrl("place.php?whichplace=airport_spooky&action=airport2_radio");
		visitUrl("choice.php?pwd&whichchoice=984&option=1", true);
		return true;
	}
	else if (ele === Element.get("stench") && elementalPlanes_access(ele))
	{
		const page: string = visitUrl("place.php?whichplace=airport_stench&action=airport3_kiosk");
		let choice: number = 1;
		const at: number = indexOf(page, "Available Assignments");
		if (at === -1)
		{
			return false;
		}

		const sustenance: number = indexOf(page, "Guest Sustenance Assurance", at);
		const jobs: string[] = ["Racism Reduction", "Compulsory Fun", "Waterway Debris Removal", "Bear Removal", "Electrical Maintenance", "Track Maintenance", "Sexism Reduction"];

		if (sustenance !== -1)
		{
			auto_log_info("Trying to avoid Guest Sustenance Assurance Dinseylandfill job.", "blue");
			for (const job of jobs)
			{
				const newAt: number = indexOf(page, job, at);
				if (newAt !== -1)
				{
					auto_log_info(`Found new job option: ${job}`, "blue");
					if (newAt < sustenance)
					{
						choice = 1;
					}
					else {
						choice = 2;
					}
				}
			}
		}

		visitUrl(`choice.php?pwd=&whichchoice=1066&option=${choice}`, true);
		return true;
	}
	else if (ele === Element.get("cold") && elementalPlanes_access(ele))
	{
		if (toBoolean(getProperty("_walfordQuestStartedToday")))
		{
			return false;
		}

		const page: string = visitUrl("place.php?whichplace=airport_cold&action=glac_walrus");

		const bucket: AshMatcher = new AshMatcher("I'll get you some (\\w+)", page);

		let choice: number = 0;
		let best: number = 0;

		const jobs: string[] = ["balls", "blood", "bolts", "chum", "ice", "milk", "moonbeams", "chicken", "rain"];
		let at: number = 1;
		while (bucket.find())
		{
			at = at + 1;
			auto_log_info(`Found bucket ${bucket.group(1)}.`, "blue");
			let i: number = 0;
			for (const job of jobs)
			{
				i = i + 1;
				if (bucket.group(1) === job && i > best)
				{
					auto_log_info(`Considering job ${job}`, "blue");
					best = i;
					choice = at;
				}
			}
		}

		visitUrl(`choice.php?pwd=&whichchoice=1114&option=${choice}`, true);
		return true;
	}
	return false;
}
