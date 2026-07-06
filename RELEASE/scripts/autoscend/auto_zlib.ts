import { Item, containsText, extractItems, extractMeat, replaceString, toInt, urlEncode, visitUrl } from "kolmafia";
import { auto_log_info, auto_log_warning } from "./auto_util";
import { kmailObject } from "./autoscend_record";
import { AshMatcher } from "./utils/kolmafiaUtils";

/*
	This is a snippet of the zlib script, to provide the process_kmail function only (as auto_process_kmail to avoid conflicts)
*/
/******************************************************************************
                                  ZLib
                    supporting functions for scripts
*******************************************************************************
   Want to say thanks?  Send me (Zarqon) a bat! (Or bat-related item)
   For a list of included functions, check out
   http://kolmafia.us/showthread.php?t=2072
******************************************************************************/
/*
//Now defined in autoscend_header.ash
record kmailObject
{
	int id;                   // message id
	string type;              // possible values observed thus far: normal, giftshop
	int fromid;               // sender\'s playerid (0 for npcs)
	int azunixtime;           // KoL server\'s unix timestamp
	string message;           // message (not including items/meat)
	int[item] items;          // items included in the message
	int meat;                 // meat included in the message
	string fromname;          // sender\'s playername
	string localtime;         // your local time according to your KoL account, human-readable string
};
*/
//Defined in autoscend/auto_zlib.ash
export function auto_process_kmail(functionname: (msg: kmailObject) => boolean): void
{
	// calls a function designed to parse a kmail.  It must accept a single kmailObject parameter,
	// and return a boolean -- true if it wants the kmail to be deleted afterwards
	let mail: Map<number, kmailObject> = new Map();
	//heeheehee\'s JSON matcher: loads all of your inbox (up to 100) into the "mail"
	let page: string = visitUrl(`api.php?pwd&what=kmail&count=100&for=${urlEncode("ZLib(modified)-powered-script")}`);
	let k: AshMatcher = new AshMatcher("\"id\":\"(\\d+)\",\"type\":\"(.+?)\",\"fromid\":\"(-?\\d+)\",\"azunixtime\":\"(\\d+)\",\"message\":\"(.+?)\",\"fromname\":\"(.+?)\",\"localtime\":\"(.+?)\"", page);
	let n: number = 0;
	while (k.find())
	{
		n = mail.size;
		(mail.get(n) ?? mail.set(n, new kmailObject()).get(n)).id = toInt(k.group(1));
		(mail.get(n) ?? mail.set(n, new kmailObject()).get(n)).type = k.group(2);
		(mail.get(n) ?? mail.set(n, new kmailObject()).get(n)).fromid = toInt(k.group(3));
		(mail.get(n) ?? mail.set(n, new kmailObject()).get(n)).azunixtime = toInt(k.group(4));
		let mbits: AshMatcher = new AshMatcher("(.*?)\\<center\\>(.+?)$", replaceString(k.group(5), "\\'", "'"));
		if (mbits.find())
		{
			(mail.get(n) ?? mail.set(n, new kmailObject()).get(n)).meat = extractMeat(mbits.group(2));
			(mail.get(n) ?? mail.set(n, new kmailObject()).get(n)).items = new Map(Object.entries(extractItems(mbits.group(2))).map(([_k, _v]) => [Item.get(_k), _v]));
			(mail.get(n) ?? mail.set(n, new kmailObject()).get(n)).message = mbits.group(toInt((mail.get(n) ?? mail.set(n, new kmailObject()).get(n)).meat > 0 || (mail.get(n) ?? mail.set(n, new kmailObject()).get(n)).items.size > 0));
		}
		else {
			(mail.get(n) ?? mail.set(n, new kmailObject()).get(n)).message = k.group(5);
		}
		(mail.get(n) ?? mail.set(n, new kmailObject()).get(n)).fromname = k.group(6);
		(mail.get(n) ?? mail.set(n, new kmailObject()).get(n)).localtime = replaceString(k.group(7), "\\", "");
	}

	let processed: Map<number, boolean> = new Map();
	for (let [i, m] of mail)
	{
		if (functionname(m))
		{
			processed.set(m.id, true);
			mail.delete(i);
		}
	}
	//delete successfully processed mail
	if (processed.size > 0)
	{
		auto_log_info("Deleting processed mail...", "blue");
		let del: string = "messages.php?the_action=delete&box=Inbox&pwd";
		for (let k_1 of processed.keys())
		{
			del += `&sel${k_1}=on`;
		}
		del = visitUrl(del);
		if (containsText(del, `${processed.size} message${(processed.size > 1 ? "s" : "")} deleted.`))
		{
			auto_log_info(`${processed.size} message${(processed.size > 1 ? "s" : "")} deleted.`, "blue");
		}
		else {
			auto_log_warning("There was a problem deleting the processed mail.  Check your inbox.", "red");
		}
	}
}
