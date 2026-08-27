import {
  cliExecute,
  containsText,
  equip,
  getAutumnatonLocations,
  itemAmount,
  Location,
  myAscensions,
} from "kolmafia";
import { $item, $location, get, set } from "libram";

import { PayPhone } from "../../../types";
import { autoAdv } from "../../auto_adventure";
import { possessEquipment } from "../../auto_equipment";
import {
  auto_abort,
  auto_is_valid,
  handleTracker,
  safeGet,
} from "../../auto_util";
import { zone_available } from "../../auto_zone";
import { in_pokefam } from "../../paths/2018/pocket_familiars";
import { in_koe } from "../../paths/2019/kingdom_of_exploathing";
import {
  bridgeGoal,
  fastenerCount,
  hedgeTrimmersNeeded,
  L9_twinPeak,
  lumberCount,
} from "../../quests/level_09";

export function auto_hasAutumnaton(): boolean {
  return (
    get("hasAutumnaton") && auto_is_valid($item`autumn-aton`) && !in_pokefam()
  );
}

// only valid when autumnaton is not currently out on a quest
export function auto_autumnatonCanAdv(canAdventureInloc: Location): boolean {
  if (!auto_hasAutumnaton()) {
    return false;
  }

  if (
    canAdventureInloc === $location`8-Bit Realm` &&
    possessEquipment($item`continuum transfunctioner`) &&
    auto_is_valid($item`continuum transfunctioner`)
  ) {
    equip($item`continuum transfunctioner`);
  }

  for (const [, loc] of getAutumnatonLocations().entries()) {
    if (loc === canAdventureInloc) {
      return true;
    }
  }
  return false;
}

function auto_autumnatonReadyToQuest(): boolean {
  if (!auto_hasAutumnaton()) {
    return false;
  }

  return itemAmount($item`autumn-aton`) !== 0;
}

export function auto_autumnatonQuestingIn(): Location {
  return safeGet("autumnatonQuestLocation");
}

function auto_autumnatonCheckForUpgrade(upgrade: string): boolean {
  const currentUpgrades: string = get("autumnatonUpgrades");
  if (containsText(currentUpgrades, upgrade)) {
    return true;
  }
  return false;
}

function auto_sendAutumnaton(loc: Location): boolean {
  if (auto_autumnatonCanAdv(loc)) {
    cliExecute(`autumnaton send ${loc}`);
    handleTracker({
      what: `Autumnaton sent to ${loc}`,
      property: "auto_otherstuff",
    });
    return true;
  }
  return false;
}

export function auto_autumnatonQuest(): boolean {
  if (!auto_autumnatonReadyToQuest()) {
    return false;
  }
  // complete any pending upgrades if haven't checked since last return
  // both of these props reset to 0 at start of day or new life due to "_" at start of them
  const completedQuestsToday: number = get("_autumnatonQuests");
  const lastQuestUpgradesChecked: number = get(
    "_auto_lastAutumnatonUpgrade",
    0,
  );
  if (completedQuestsToday > lastQuestUpgradesChecked) {
    try {
      cliExecute("autumnaton upgrade");
    } catch {}
    set("_auto_lastAutumnatonUpgrade", completedQuestsToday);
  }
  // prioritize getting important upgrades
  if (!auto_autumnatonCheckForUpgrade("leftarm1")) {
    if (auto_sendAutumnaton($location`The Haunted Pantry`)) {
      return false;
    } else {
      auto_abort(
        "Haunted pantry should always be available for autumnaton, but autoscend determined it is not. Report issue.",
      );
    }
  }

  if (!auto_autumnatonCheckForUpgrade("leftleg1")) {
    // some bat zones may not be adventured in, so try them all
    if (auto_sendAutumnaton($location`Guano Junction`)) {
      return false;
    }
    if (auto_sendAutumnaton($location`The Batrat and Ratbat Burrow`)) {
      return false;
    }
    if (auto_sendAutumnaton($location`The Beanbat Chamber`)) {
      return false;
    }
    if (auto_sendAutumnaton($location`Cobb's Knob Harem`)) {
      return false;
    }
    if (auto_sendAutumnaton($location`Noob Cave`)) {
      return false;
    }
  }

  if (!auto_autumnatonCheckForUpgrade("rightleg1")) {
    if (auto_sendAutumnaton($location`The Haunted Library`)) {
      return false;
    }
    if (auto_sendAutumnaton($location`The Neverending Party`)) {
      return false;
    }
    if (auto_sendAutumnaton($location`The Haunted Kitchen`)) {
      return false;
    }
  }

  if (!auto_autumnatonCheckForUpgrade("rightarm1")) {
    if (auto_sendAutumnaton($location`The Overgrown Lot`)) {
      return false;
    }
  }
  // should we go regardless of if we have arm upgrades?
  if (
    auto_autumnatonCheckForUpgrade("leftarm1") &&
    auto_autumnatonCheckForUpgrade("rightarm1") &&
    itemAmount($item`barrel of gunpowder`) < 5 &&
    get("sidequestLighthouseCompleted") === "none" &&
    !in_koe()
  ) {
    const targetLocation: Location = $location`Sonofa Beach`;
    if (
      !auto_autumnatonCanAdv(targetLocation) &&
      zone_available(targetLocation)
    ) {
      // force one turn in zone to unlock it for bot
      return autoAdv(targetLocation);
    }
    if (auto_sendAutumnaton(targetLocation)) {
      return false;
    }
  }
  // acquire items to help quests
  if (fastenerCount() < bridgeGoal() && lumberCount() < bridgeGoal()) {
    const targetLocation: Location = $location`The Smut Orc Logging Camp`;
    if (
      !auto_autumnatonCanAdv(targetLocation) &&
      zone_available(targetLocation)
    ) {
      // force one turn in zone to unlock it for bot
      return autoAdv(targetLocation);
    }
    if (auto_sendAutumnaton(targetLocation)) {
      return false;
    }
  }

  if (hedgeTrimmersNeeded() > 0) {
    const targetLocation: Location = $location`Twin Peak`;
    if (
      !auto_autumnatonCanAdv(targetLocation) &&
      zone_available(targetLocation)
    ) {
      // force one turn in zone to unlock it for bot
      // twin peak requires NC setup, call function instead of directly adventuring there
      return L9_twinPeak();
    }
    if (auto_sendAutumnaton(targetLocation)) {
      return false;
    }
  }
  // acquire more shadow bricks
  if (PayPhone.auto_neededShadowBricks() > 0) {
    const ingress: string = get("shadowRiftIngress");
    if (["cemetery", "hiddencity", "pyramid"].includes(ingress)) {
      if (auto_sendAutumnaton($location`Shadow Rift`)) {
        return false;
      }
    }
  }
  // a location of last resort for those without shadow rifts
  if (get("shadowRiftIngress") === "") {
    //Cookbookbat materials if you have a Cookbookbat and Autumn Fest Ale+stone wool or Autumn Leaves
    if (
      itemAmount($item`stone wool`) === 0 &&
      get("lastTempleAdventures") < myAscensions()
    ) {
      if (auto_sendAutumnaton($location`The Hidden Temple`)) {
        return false;
      }
    } else {
      if (auto_sendAutumnaton($location`The Outskirts of Cobb's Knob`)) {
        return false;
      }
    }
  }

  return false;
}
