import {
  cliExecute,
  equip,
  getProperty,
  haveEquipped,
  splitString,
} from "kolmafia";
import { $item, get, set } from "libram";

import { possessEquipment } from "../../auto_equipment";
import { auto_is_valid } from "../../auto_util";
import { maximizer } from "../../utils/maximizer";

export function auto_hasRetrocape(): boolean {
  return (
    possessEquipment($item`unwrapped knock-off retro superhero cape`) &&
    auto_is_valid($item`unwrapped knock-off retro superhero cape`)
  );
}

export function auto_configureRetrocape(hero: string, tag: string): boolean {
  if (!auto_hasRetrocape()) {
    return false;
  }
  // store the requested settings in a property so we can handle them later
  const settings: string = `${hero},${tag}`;
  set("auto_retrocapeSettings", settings);
  // cut down potential server hits by telling the maximizer to not consider it.
  maximizer.exclude($item`unwrapped knock-off retro superhero cape`);
  return true;
}

export function auto_handleRetrocape(): boolean {
  if (!auto_hasRetrocape()) {
    return false;
  }

  let settingsProperty: string = get("auto_retrocapeSettings");
  if (settingsProperty === "") {
    const capeConfiguration: string = getProperty(
      "retroCapeWashingInstructions",
    );
    const beatenUpCount: number = get("auto_beatenUpCount", 0);
    if (capeConfiguration === "thrill" && beatenUpCount >= 5) {
      // if currently configured for stats and have been getting beaten up, change to stun
      settingsProperty = "heck,hold";
    } else {
      return false;
    }
  }

  const settings: Map<number, string> = new Map(
    splitString(settingsProperty, ",").map((_v, _i) => [_i, _v]),
  );
  if (settings.size !== 2) {
    return false;
  }

  const hero: string = settings.get(0) ?? "";
  const tag: string = settings.get(1) ?? "";

  if (
    hero !== "muscle" &&
    hero !== "mysticality" &&
    hero !== "moxie" &&
    hero !== "vampire" &&
    hero !== "heck" &&
    hero !== "robot"
  ) {
    return false;
  }
  if (tag !== "hold" && tag !== "thrill" && tag !== "kiss" && tag !== "kill") {
    return false;
  }
  let tempHero: string = hero;
  if (hero === "muscle") {
    tempHero = "vampire";
  }
  if (hero === "mysticality") {
    tempHero = "heck";
  }
  if (hero === "moxie") {
    tempHero = "robot";
  }
  // avoid uselessly reconfiguring the cape
  if (
    get("retroCapeSuperhero") !== tempHero ||
    get("retroCapeWashingInstructions") !== tag
  ) {
    // retrocape [muscle | mysticality | moxie | vampire | heck | robot] [hold | thrill | kiss | kill]
    cliExecute(`retrocape ${tempHero} ${tag}`); // configures and equips
  } else {
    equip($item`unwrapped knock-off retro superhero cape`); // already configured, just equip
  }
  return (
    get("retroCapeSuperhero") === tempHero &&
    get("retroCapeWashingInstructions") === tag &&
    haveEquipped($item`unwrapped knock-off retro superhero cape`)
  );
}
