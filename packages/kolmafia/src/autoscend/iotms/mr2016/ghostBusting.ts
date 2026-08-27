import { Location, toLocation, totalTurnsPlayed, visitUrl } from "kolmafia";
import { $item, $location, $locations, $slot, get, set } from "libram";

import { autoAdv } from "../../auto_adventure";
import {
  autoForceEquip,
  autoForceEquip$3,
  possessEquipment,
} from "../../auto_equipment";
import { acquireHP } from "../../auto_restore";
import {
  auto_can_equip,
  auto_log_error,
  auto_log_info,
  safeGet,
} from "../../auto_util";
import { zone_available } from "../../auto_zone";
import { is_professor } from "../../paths/2024/wereprofessor";
import { startHippyBoatmanSubQuest } from "../../quests/level_any";
import {
  startArmorySubQuest,
  startGalaktikSubQuest,
  startMeatsmithSubQuest,
} from "../../quests/optional";
import { AshMatcher } from "../../utils/kolmafiaUtils";

export function expectGhostReport(): boolean {
  if (totalTurnsPlayed() >= get("nextParanormalActivity")) {
    if (totalTurnsPlayed() > get("nextParanormalActivity")) {
      const page: string = visitUrl("charpane.php");
      const myGhost: AshMatcher = new AshMatcher(
        '<tr rel="protonquest">(?:.*?)<b>(.*?)</b>',
        page,
      );
      if (myGhost.find()) {
        const goal: Location = toLocation(myGhost.group(1));
        set("ghostLocation", goal);
        set("questPAGhost", "started");
      }
    }
    //<tr rel="protonquest"><td class="small" colspan="2"><div>Investigate the paranormal activity reported at <A class=nounder target=mainpane href=place.php?whichplace=manor1><b>The Haunted Conservatory</b></a>.</div></td></tr>

    if (get("questPAGhost") === "unstarted") {
      return true;
    }
  }
  return false;
}

export function haveGhostReport(): boolean {
  if (get("questPAGhost") === "unstarted") {
    return false;
  }
  if (
    get("questPAGhost") === "started" &&
    safeGet("ghostLocation") !== $location.none
  ) {
    return true;
  }
  return false;
}

export function LX_ghostBusting(): boolean {
  //a function for busting or killing ghosts associated with [Protonic Accelerator Pack].
  //do not check if we have the IOTM because [Almost-dead_walkie-talkie] gives access to these ghosts without the proton pack.
  if (get("questPAGhost") === "unstarted") {
    if (!expectGhostReport()) {
      return false;
    }
    if (get("questPAGhost") === "unstarted") {
      return false;
    }
  }
  // goal & progress specific reasons to skip busting this turn go below.
  const goal: Location = safeGet("ghostLocation");
  if (goal === $location.none) {
    return false;
  }
  if (
    goal === $location`Inside the Palindome` &&
    !possessEquipment($item`Talisman o' Namsilat`)
  ) {
    return false;
  }
  if (is_professor()) {
    return false;
  }
  //zone unlocks which require no adv spent. ghost will not show up here unless zone is available. no need to skip ghost if zone unavailable.
  startHippyBoatmanSubQuest(); //unlocks $location[The Old Landfill].
  //zone unlocks which require no adv spent. where a ghost can show up even if you did not unlock the zone. if failed to unlock we skip this ghost
  startMeatsmithSubQuest(); //unlocks $location[The Skeleton Store]
  startArmorySubQuest(); //unlocks $location[Madness Bakery]
  startGalaktikSubQuest(); //unlocks $location[The Overgrown Lot]
  if (
    $locations`The Skeleton Store, Madness Bakery, The Overgrown Lot`.includes(
      goal,
    ) &&
    !zone_available(goal)
  ) {
    auto_log_error(
      `Failed to unlock the location [${goal}]. skipping this ghost...`,
    );
    set("questPAGhost", "unstarted");
    set("ghostLocation", "");
    return false;
  }

  if (
    possessEquipment($item`protonic accelerator pack`) &&
    auto_can_equip($item`protonic accelerator pack`)
  ) {
    auto_log_info(`Ghost busting time! At: ${goal}`, "blue");
    autoForceEquip$3($item`protonic accelerator pack`);
  } else {
    //hypothetical future path where pack cannot be equipped. or we used [Almost-dead_walkie-talkie] to get a ghost without the pack
    auto_log_info(
      `We can not bust ghosts. but we can still kill them and get ~100 MP worth of restore items. killing ghost at: ${goal}`,
      "blue",
    );
  }
  if (goal === $location`Inside the Palindome`) {
    autoForceEquip($slot`acc3`, $item`Talisman o' Namsilat`);
  }
  acquireHP();
  return autoAdv(goal);
}
