import {
  entityEncode,
  Familiar,
  formFields,
  getProperty,
  inHardcore,
  Item,
  itemAmount,
  Location,
  myAscensions,
  myDaycount,
  myFamiliar,
  myPath,
  myTurncount,
  setProperty,
  splitString,
  toFamiliar,
  toInt,
  turnsPlayed,
  write,
  writeln,
} from "kolmafia";
import { $locations, get } from "libram";

import { initializeSettings } from "./autoscend";
import { auto_settings } from "./autoscend/auto_settings";
import { autoscend_current_version } from "./autoscend/autoscend_migration";
import { auto_hasPowerfulGlove } from "./autoscend/iotms/mr2020";
import { isActuallyEd } from "./autoscend/paths/actually_ed_the_undying";
import { in_ocrs } from "./autoscend/paths/one_crazy_random_summer";
import { ctor, fileAsMap } from "./autoscend/utils/kolmafiaUtils";

// Thanks to relay_cheeseascend.ash for a starting point here.

class Setting {
  constructor(
    public name: string = "",
    public type: string = "",
    public description: string = "",
  ) {}
}

interface SettingCategory {
  name: string;
  description: string;
  color: string;
}

const settingCategories: SettingCategory[] = [
  {
    name: "Anytime",
    description:
      "This setting can be changed at any time and takes effect immediately.",
    color: "#00ffff",
  },
  {
    name: "Iotm",
    description:
      "Settings for items bound to accounts, sorted by year of release descending.",
    color: "#00b7c4",
  },
  {
    name: "Pre",
    description:
      "Next time we initialize settings for autoscend this will be used to determine what we should set some Post type settings to.",
    color: "#ffff00",
  },
  {
    name: "Post",
    description:
      "Settings for current ascension. Automatically reconfigured each ascension when we initialize setting for that ascension. After settings have been initialized you may change this. Under some circumstances they will be automatically changed mid ascension.",
    color: "#00ff00",
  },
  {
    name: "Action",
    description:
      "This causes something to immediately (or when reasonable) happen.",
    color: "#af6fbf",
  },
  {
    name: "Sharing",
    description: "Allows sharing game data.",
    color: "#ff6644",
  },
];

function write_styles(): void {
  // This function provided by Zen00.
  writeln(
    `<style type='text/css'>body {width: 95%;margin: auto;background: #EAEAEA;text-align:center;padding:0;cursor:default;user-select: none;-webkit-user- select: none;-moz-user-select: text;}h1 {font-family:times;font-size:125%;color:#000;}table, th, td {border: 1px solid black;}</style>`,
  );
}

function handleSetting(category: SettingCategory, set: Setting): void {
  const name = entityEncode(set.name);
  const encodedValue: string = entityEncode(getProperty(name));

  switch (set.type) {
    case "boolean": {
      const checked: string = get(name, false) ? ` checked` : ``;
      write(
        `<tr bgcolor=${category.color}><td align=center>${name}</td><td align=center><input type='checkbox' name='${name}' value='true'${checked}>`,
      );
      writeln(`</td><td>${entityEncode(set.description)}</td></tr>`);
      break;
    }
    default:
      write(`<tr bgcolor=${category.color}><td align=center>${name}</td>`);
      write(
        `<td align='center'><input type='text' name='${name}' value="${encodedValue}" /></td>`,
      );
      writeln(`<td>${entityEncode(set.description)}</td></tr>`);
      break;
  }

  writeln(
    `<input type='hidden' name='${name}_oldvalue' value="${encodedValue}" />`,
  );
}

function write_settings_key(): void {
  //display the key to the settings table.
  writeln("<table><tr><th>Settings Color Codings</th></tr>");
  for (const category of settingCategories) {
    writeln(
      `<tr bgcolor=${category.color}><td>${category.name}: ${category.description}</td></tr>`,
    );
  }
  writeln("</table>");
}

function generateTrackingData(
  tracked: string,
  print_between: string,
  stacked: boolean,
): void {
  let day: number = 0;
  const tracking: Map<number, string> = new Map(
    splitString(getProperty(tracked), ", ").map((_v, _i) => [_i, _v]),
  );
  if (getProperty(tracked) === "") {
    return;
  }
  const tracking_stacked: Map<number, string> = new Map();
  const stack_counts: Map<number, number> = new Map();
  let unique_idx: number = -1;
  let last_event: string = "";
  for (const [, event] of tracking) {
    if (last_event !== event) {
      unique_idx++;
      tracking_stacked.set(unique_idx, event);
      stack_counts.set(unique_idx, 1);
      last_event = event;
    } else {
      stack_counts.set(unique_idx, (stack_counts.get(unique_idx) ?? 0) + 1);
    }
  }

  const tracking_to_use: Map<number, string> = stacked
    ? tracking_stacked
    : tracking;

  for (const [idx, rawEvent] of tracking_to_use) {
    if (rawEvent === "") {
      continue;
    }

    let event = rawEvent.replaceAll(/[()]/g, "");
    event = event.replaceAll("Asdon Marton:", "Asdon Martin -");
    event = event.replaceAll("CHEAT CODE:", "CHEAT CODE -");

    const current: Map<number, string> = new Map(
      splitString(event, ":").map((_v, _i) => [_i, _v]),
    );
    const curDay: number = toInt(current.get(0) ?? current.set(0, "").get(0));
    if (curDay > day) {
      day = curDay;
      if (day > 1) {
        writeln("<br><br>");
      }
      writeln(`<b>Day ${day}:</b>`);
    }
    let toWrite = "(";

    for (let i = 1; i < current.size; i++) {
      toWrite += current.get(i) ?? current.set(i, "").get(i);
      if (i < current.size - 1) {
        toWrite += ":";
      }
    }
    if (stacked) {
      if ((stack_counts.get(idx) ?? stack_counts.set(idx, 0).get(idx)) > 1) {
        toWrite = `${toWrite} <b>x${(stack_counts.get(idx) ?? stack_counts.set(idx, 0).get(idx)).toString()}</b>`;
      }
    }
    toWrite = `${toWrite})${print_between}`;
    writeln(toWrite);
  }
}

function generateTrackingData$1(
  tracked: string,
  stacked: boolean = true,
): void {
  generateTrackingData(tracked, ",", stacked);
}

function generateTrackingDataSplitByNewLine(
  tracked: string,
  stacked: boolean = true,
): void {
  generateTrackingData(tracked, "<br>", stacked);
}

function write_familiar(): void {
  //display current 100% familiar. and options related to it.
  const hundred_fam: Familiar = toFamiliar(getProperty("auto_100familiar"));
  if (hundred_fam !== Familiar.none) {
    //we already have a 100% familiar set for this ascension
    if (turnsPlayed() === 0) {
      const to_write: string = `100% familiar is set to = ${hundred_fam}. Turns played is at 0 so it might be possible to change this. So long as you have not done any free fights<br>`;
      writeln(to_write);
      writeln("<form action='' method='post'>");
      writeln("<input type='hidden' name='auto_100familiar' value='none'/>");
      writeln(
        "<input type='submit' name='' value='Disable 100% familiar run'/></form>",
      );
    } else {
      const to_write: string = `100% familiar is set to = ${hundred_fam}<br>`;
      writeln(to_write);
    }
  } else {
    //100% familiar not set.
    if (turnsPlayed() === 0) {
      writeln(
        "100% familiar has not been set. Turns played is at 0 so it might be possible to change this. So long as you have not done any free fights<br>",
      );
      writeln("<form action='' method='post'>");
      writeln(
        `<input type='hidden' name='auto_100familiar' value='${myFamiliar()}'/>`,
      );
      writeln(
        "<input type='submit' name='' value='Set current familiar as 100% target'/></form>",
      );
    }
    //we could use an else to report that we are not in a 100% familiar run and it is too late to change it. but there is no need to.
  }
}

function applySettingChanges(): void {
  const fields = formFields();
  for (const x of Object.keys(fields)) {
    //Checkboxes that are false are not supplied, so we have to look at the *_oldvalue
    //fields to see whether there is a "false" checkbox we're not seeing.  So, ignore
    //the fields that don't end in _oldvalue.
    if (!x.endsWith("_oldvalue")) {
      continue;
    }

    //Recover name of property and its value.
    //If the new value field isn't present, the checkbox was unticked -> "false".
    const prop: string = x.slice(0, -"_oldvalue".length);
    const newSetting: string = prop in fields ? fields[prop] : "false";
    const oldSetting: string = fields[x];

    if (oldSetting === newSetting) {
      if (getProperty(prop) !== newSetting) {
        writeln(
          `You did not change setting ${prop}. It changed since you last loaded the page, ignoring.<br>`,
        );
      }
      continue;
    }
    if (getProperty(prop) !== newSetting) {
      writeln(`Changing setting ${prop} to ${newSetting}<br>`);
      setProperty(prop, newSetting);
    }
  }
}

function write_locations_visited(): void {
  // Display the locations we've spent turns
  // Make a list of the locations we've visited
  let ranked_list: Map<number, Location> = new Map();
  for (const loc of $locations.all()) {
    if (loc.turnsSpent > 0) {
      ranked_list.set(ranked_list.size, loc);
    }
  }
  // Sort in descending order
  ranked_list = new Map(
    [...ranked_list.entries()]
      .map(([index, value]) => {
        return { _k: index, _v: value, _expr: -value.turnsSpent };
      })
      .sort((_a, _b) =>
        _a._expr < _b._expr ? -1 : _a._expr > _b._expr ? 1 : 0,
      )
      .map((e) => [e._k, e._v]),
  );
  // Write the table
  writeln('<table style="margin-left:auto;margin-right:auto;">');
  writeln("<tr><th>Location</th> <th>Turns</th></tr>");
  for (const [, loc] of ranked_list) {
    writeln(`<tr><td>${loc.toString()}</td><td>${loc.turnsSpent}</td></tr>`);
  }
  writeln("</table>");
}

function writeSettings(filename: string) {
  const fromMap = fileAsMap(filename, [String, Number, ctor(Setting)]);

  for (const category of settingCategories) {
    const settings = fromMap.get(category.name.toLowerCase());

    if (!settings?.size) continue;

    for (const setting of settings.values()) {
      handleSetting(category, setting);
    }
  }
}

export function main(): void {
  if (formFields()["extraSettings"] === undefined) {
    loadMain();
  } else {
    loadExtra();
  }
}

function loadMain(): void {
  auto_settings(); //runs every time. upgrades old settings to newest format, delete obsolete settings, and configures defaults.
  initializeSettings(); //runs once per ascension. should not handle anything other than intialising settings for this ascension.

  write_styles();
  writeln("<html><head><title>autoscend manager</title>");
  writeln("</head><body><h1>autoscend manager</h1>");
  //button to interrupt script
  writeln("<form action='' method='post'>");
  writeln("<input type='hidden' name='auto_interrupt' value='true'/>");
  writeln(
    "<input type='hidden' name='auto_interrupt_oldvalue' value='false'/>",
  );
  writeln(
    "<input type='submit' name='' value='Safely Stop Autoscend'/></form>",
  );
  //TODO add button to run autoscend

  write_familiar(); //display current 100% familiar. and options related to it.

  if (myAscensions() === toInt(getProperty("auto_doneInitialize"))) {
    writeln(
      "Settings have been initialized for current ascension. You may change Post type settings<br>",
    );
  } else {
    writeln(
      "Settings have not been initialized for current ascension. Do not change Post type settings<br>",
    );
  }

  writeln(
    `<br><a href="#" onclick="document.body.insertAdjacentHTML('beforeend','<form id=f method=post action=relay_autoscend.js?relay=true><input name=extraSettings value=1></form>');f.submit();return false;">For extra settings click here</a><br><br>`,
  );

  applySettingChanges();

  writeln("<form action='' method='post'>");
  writeln(
    "<table><tr><th width=20%>Setting</th><th width=20%>Value</th><th width=60%>Description</th></tr>",
  );

  writeSettings("autoscend_settings.txt");

  writeln(
    "<tr><td align=center colspan='3'><input type='submit' name='' value='Save Changes'/></td></tr></table></form>",
  );

  write_settings_key(); //display the key to the settings table

  if (getProperty("auto_tracker_path") !== "") {
    writeln(`<h2>${myPath().toString()}</h2>`);
    generateTrackingData$1("auto_tracker_path");
  }

  writeln("<h2>Banishes</h2>");
  generateTrackingData$1("auto_banishes");

  writeln("<h2>Free Runaways</h2>");
  generateTrackingData$1("auto_freeruns");

  writeln('<h2>Yellow Rays <img src="images/itemimages/eyes.gif"></h2>');
  generateTrackingData$1("auto_yellowRays");

  writeln("<h2>Sniffing</h2>");
  generateTrackingData$1("auto_sniffs");

  writeln("<h2>Copies</h2>");
  generateTrackingData$1("auto_copies");

  writeln("<h2>Replaces</h2>");
  generateTrackingData$1("auto_replaces");

  writeln("<h2>Instakills</h2>");
  generateTrackingData$1("auto_instakill");

  writeln("<h2>Beaten Up</h2>");
  writeln(getProperty("auto_beatenUpLocations"));

  writeln("<h2>Forced Noncombats</h2>");
  generateTrackingDataSplitByNewLine("auto_forcedNC");

  writeln("<h2>Eated</h2>");
  generateTrackingData$1("auto_eaten");

  writeln("<h2>Drinkenated</h2>");
  generateTrackingData$1("auto_drunken");

  writeln("<h2>Chewed</h2>");
  generateTrackingData$1("auto_chewed");
  // Don't want to show if they can't make wishes, but maybe they can with pocket wishes
  if (
    getProperty("auto_wishes") !== "" ||
    itemAmount(Item.get("genie bottle")) > 0
  ) {
    writeln("<h2>Wishes</h2>");
    generateTrackingData$1("auto_wishes");
  }

  writeln("<h2>Lucky Adventures</h2>");
  generateTrackingDataSplitByNewLine("auto_lucky");

  if (isActuallyEd()) {
    writeln(
      '<h2>Lash of the Cobra <img src="images/itemimages/cobrahead.gif"></h2>',
    );
    generateTrackingData$1("auto_lashes");

    writeln(
      '<h2>Talisman of Renenutet <img src="images/itemimages/tal_r.gif"></h2>',
    );
    generateTrackingData$1("auto_renenutet");
  }

  if (in_ocrs()) {
    writeln("<h2>One Crazy Random Summer Fun-o-meter!</h2>");
    generateTrackingData$1("auto_funTracker");
  }

  if (!inHardcore()) {
    writeln("<h2>Pulls</h2>");
    generateTrackingData$1("auto_pulls");
  }

  if (auto_hasPowerfulGlove()) {
    writeln("<h2>Powerful Glove</h2>");
    generateTrackingData$1("auto_powerfulglove");
  }

  if (getProperty("auto_iotm_claim") !== "") {
    writeln("<h2>IOTM Item/Effects Claimed.</h2>");
    generateTrackingData$1("auto_iotm_claim");
  }

  if (getProperty("auto_mapperidot") !== "") {
    writeln("<h2>Map the Monsters/Peridot of Peril</h2>");
    generateTrackingData$1("auto_mapperidot");
  }

  writeln("<h2>Other Stuff</h2>");
  generateTrackingData$1("auto_otherstuff");

  writeln("<h2>Info</h2>");
  writeln(`Ascension: ${myAscensions()}<br>`);
  writeln(`Day: ${myDaycount()}<br>`);
  writeln(`Turns Played: ${myTurncount()}<br>`);
  writeln(`Tavern: ${getProperty("tavernLayout")}<br>`);
  if (isActuallyEd()) {
    writeln(`Combats: ${getProperty("auto_edCombatCount")}<br>`);
    writeln(`Combat Rounds: ${getProperty("auto_edCombatRoundCount")}<br>`);
  }
  //TODO: need way to track version independent of svn branch since you can have different branches checked out
  writeln(`Autoscend Version: ${autoscend_current_version()}<br>`);

  writeln("<h2>Locations visited</h2>");
  write_locations_visited();

  writeln("<br>");
  writeln("</body></html>");
}

function loadExtra() {
  write_styles();
  writeln("<html><head><title>autoscend extra settings</title>");
  writeln("</head><body><h1>autoscend extra settings</h1>");

  writeln(
    '<br><a href="relay_autoscend.js?relay=true">Return to main autoscend page</a><br><br>',
  );

  //generate settings table
  applySettingChanges();

  writeln("<form action='' method='post'>");
  writeln(
    "<table><tr><th width=20%>Setting</th><th width=20%>Value</th><th width=60%>Description</th></tr>",
  );

  writeSettings("autoscend_settings_extra.txt");

  writeln(
    "<tr><td align=center colspan='3'><input type='submit' name='' value='Save Changes'/></td></tr></table></form>",
  );

  write_settings_key(); //display the key to the settings table

  writeln("</body></html>");
}
