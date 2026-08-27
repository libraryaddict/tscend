import {
  containsText,
  haveFamiliar,
  haveSkill,
  itemAmount,
  myMp,
  myPrimestat,
  myTurncount,
  Stat,
  turnsPlayed,
  use,
  visitUrl,
} from "kolmafia";
import { $familiar, $item, $location, $skill, $stat, get } from "libram";

import { autoAdv } from "../../auto_adventure";
import { possessEquipment } from "../../auto_equipment";
import { pathHasFamiliar } from "../../auto_familiar";
import { auto_is_valid, backupSetting } from "../../auto_util";
import { isActuallyEd } from "../../paths/2015/actually_ed_the_undying";
import { in_glover } from "../../paths/2018/g_lover";
import { in_darkGyffte } from "../../paths/2019/dark_gyffte";
import { in_wereprof, is_professor } from "../../paths/2024/wereprofessor";

export function loveTunnelAcquire(
  enforcer: boolean,
  statItem: Stat,
  engineer: boolean,
  loveEffect: number,
  equivocator: boolean,
  giftItem: number,
): boolean {
  return loveTunnelAcquire$1(
    enforcer,
    statItem,
    engineer,
    loveEffect,
    equivocator,
    giftItem,
    "",
  );
}

function loveTunnelAcquire$1(
  enforcer: boolean,
  statItem: Stat,
  engineer: boolean,
  loveEffect: number,
  equivocator: boolean,
  giftItem: number,
  option: string,
): boolean {
  if (get("_loveTunnelUsed")) {
    return false;
  }
  if (loveEffect < 0 || loveEffect > 4) {
    return false;
  }
  if (giftItem < 0 || giftItem > 7) {
    return false;
  }
  if (giftItem === 6 && !haveFamiliar($familiar`Space Jellyfish`)) {
    return false;
  }
  if (loveEffect === 2 && !pathHasFamiliar()) {
    loveEffect = 3;
  }
  if (isActuallyEd() && (myMp() < 20 || myTurncount() < 10)) {
    return false;
  }
  if ((in_wereprof() && turnsPlayed() < 50) || is_professor()) {
    return false; //don't try LOV Tunnel if haven't retransformed back to werewolf or is a professor in WereProf
  }

  const temp: string = visitUrl("place.php?whichplace=town_wrong");
  if (!containsText(temp, "townwrong_tunnel")) {
    return false;
  }

  backupSetting("choiceAdventure1222", "1"); // The Tunnel of L.O.V.E.

  if (enforcer) {
    backupSetting("choiceAdventure1223", "1"); // L.O.V. Entrance - Fight Enforcer
  } else {
    backupSetting("choiceAdventure1223", "2"); // L.O.V. Entrance - Skip Enforcer
  }

  let statValue: number = 4;
  if (statItem === $stat.none) {
    if (in_darkGyffte() && possessEquipment($item`vampyric cloake`)) {
      statItem = $stat`Muscle`;
    } else {
      statItem = myPrimestat();
    }
  }
  switch (statItem) {
    case $stat`Muscle`:
      statValue = 1;
      break;
    case $stat`Mysticality`:
      statValue = 2;
      break;
    case $stat`Moxie`:
      statValue = 3;
      break;
  }

  if (
    !haveSkill($skill`Torso Awareness`) &&
    !haveSkill($skill`Best Dressed`) &&
    statValue === 1
  ) {
    if (
      !(
        possessEquipment($item`protonic accelerator pack`) ||
        possessEquipment($item`vampyric cloake`)
      ) &&
      auto_is_valid($item`LOV Epaulettes`)
    ) {
      statValue = 2;
    } else {
      statValue = 3;
    }
  }

  if (!auto_is_valid($item`LOV Epaulettes`) && statValue === 2) {
    // if myst and in G-Lover
    statValue = 3; // Resistance and Meat seems better than ML
  }

  backupSetting("choiceAdventure1224", statValue.toString()); // L.O.V. Equipment Room
  //1		Cardigan,			LOV Eardigan	Shirt - 25% Muscle Stats, 8-12HP Regen, +25ML, End of Day
  //2		Epaulettes,			LOV Epaulettes	Back  - 25% Myst Stats, 4-6MP Regen, -3MPCombatSkills, End of Day
  //3		Earrings			LOV Earrings	Acc   - 25% Moxie Stats, +3 PrismRes, +50% Meat, End of Day
  //4		Nothing

  if (engineer) {
    backupSetting("choiceAdventure1225", "1"); // L.O.V. Engine Room - Fight Engineer
  } else {
    backupSetting("choiceAdventure1225", "2"); // L.O.V. Engine Room - Skip Engineer
  }

  if (in_glover()) {
    loveEffect = 3; // Item drops seems better than familiar weight
  }

  backupSetting("choiceAdventure1226", loveEffect.toString()); // L.O.V. Emergency Room
  //1	Lovebotamy					+10 stats per fight
  //2	Open Heart Surgery			+10 familiar weight (50 adventures)
  //3	Wandering Eye Surgery		+50% item drops (50 adventures)
  //4	Nothing

  if (equivocator) {
    backupSetting("choiceAdventure1227", "1"); // L.O.V. Elbow Room - Fight Equivocator
  } else {
    backupSetting("choiceAdventure1227", "2"); // L.O.V. Elbow Room - Skip Equivocator
  }

  if (in_glover()) {
    giftItem = 1; // Only item G-Lover can use
  }

  backupSetting("choiceAdventure1228", giftItem.toString());
  //1		Boomerang			LOV Enamorang (combat item) stagger, consumed (15 turn later copy?)
  //2		Toy Dart Gun		LOV Emotionizer (usable self/others)
  //3		Chocolate			LOV Extraterrestrial Chocolate (+3/2/1 advs, independent chocolate?)
  //4		Flowers				LOV Echinacea Bouquet (Spleen). (stats + small hp/mp, 1 toxicity)
  //5		Plush Elephant		LOV Elephant (Shield, DR+10)
  //6		Toast? Only with Space Jellyfish?
  //7		Nothing

  const retval: boolean = autoAdv($location`The Tunnel of L.O.V.E.`);

  if (itemAmount($item`LOV Extraterrestrial Chocolate`) > 0) {
    use(1, $item`LOV Extraterrestrial Chocolate`);
  }
  return retval;
}
