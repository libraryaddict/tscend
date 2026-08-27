import {
  cliExecute,
  Familiar,
  getCampground,
  haveEffect,
  isUnrestricted,
  itemAmount,
  myBjornedFamiliar,
  myDaycount,
  myLevel,
  Phylum,
  toInt,
} from "kolmafia";
import {
  $effect,
  $element,
  $familiar,
  $item,
  $location,
  $phylum,
  DNALab,
  get,
  set,
} from "libram";

import { Bjorn, ElementalPlanes } from "../../../types";
import { autoAdv } from "../../auto_adventure";
import { canChangeToFamiliar, handleFamiliar$1 } from "../../auto_familiar";
import { auto_log_warning, safeGet } from "../../auto_util";
import { in_heavyrains } from "../../paths/2014/heavy_rains";
import { ns_crowd3 } from "../../quests/level_13";

export function dna_startAcquire(): boolean {
  if (!isUnrestricted($item`Little Geneticist DNA-Splicing Lab`)) {
    return false;
  }
  if (get("auto_day1_dna") === "finished" || myDaycount() !== 1) {
    return false;
  }
  if (haveEffect($effect`Human-Weird Thing Hybrid`) > 9999) {
    return false;
  }
  if (itemAmount($item`DNA extraction syringe`) === 0) {
    return false;
  }

  if (safeGet("dnaSyringe") === $phylum`weird`) {
    cliExecute("camp dnainject");
  } else {
    if (!canChangeToFamiliar($familiar`Machine Elf`)) {
      const bjorn: Familiar = myBjornedFamiliar();
      if (bjorn === $familiar`Machine Elf`) {
        Bjorn.handleBjornify($familiar`Grinning Turtle`);
      }
      handleFamiliar$1($familiar`Machine Elf`);
      autoAdv($location`The Deep Machine Tunnels`);
      if (bjorn === $familiar`Machine Elf`) {
        Bjorn.handleBjornify(bjorn);
      }
      cliExecute("camp dnainject");
    } else if (ElementalPlanes.elementalPlanes_access($element`sleaze`)) {
      if ($location`Sloppy Seconds Diner`.turnsSpent === 0) {
        autoAdv($location`Sloppy Seconds Diner`);
      }
      autoAdv($location`Sloppy Seconds Diner`);
      cliExecute("camp dnainject");
    }
  }
  set("auto_day1_dna", "finished");
  if (haveEffect($effect`Human-Weird Thing Hybrid`) !== 2147483647) {
    auto_log_warning(
      "DNA Hybridization failed, perhaps it was due to ML which is annoying us right now.",
      "red",
    );
  }
  return true;
}

export function dna_generic(): boolean {
  if (!isUnrestricted($item`Little Geneticist DNA-Splicing Lab`)) {
    return false;
  }
  if (safeGet("dnaSyringe") === $phylum.none) {
    return false;
  }

  let potion: Phylum[];

  if (in_heavyrains()) {
    switch (myDaycount()) {
      case 1:
        potion = [$phylum`construct`, $phylum`fish`];
        break;
      case 2:
        potion = [$phylum`fish`, $phylum`constellation`, $phylum`dude`];
        break;
      case 3:
        potion = [$phylum`construct`, $phylum`humanoid`, $phylum`dude`];
        break;
      default:
        potion = [$phylum`humanoid`, $phylum`construct`, $phylum`dude`];
        break;
    }
  } else {
    switch (myDaycount()) {
      case 1:
        potion = [$phylum`construct`, $phylum`fish`];
        break;
      case 2:
        potion = [$phylum`fish`, $phylum`constellation`, $phylum`dude`];
        break;
      case 3:
        potion = [$phylum`construct`, $phylum`humanoid`, $phylum`dude`];
        break;
      default:
        potion = [$phylum`humanoid`, $phylum`construct`, $phylum`dude`];
        break;
    }
  }

  let i: number = 0;
  for (const phy of potion) {
    if (safeGet("dnaSyringe") === phy && get("_dnaPotionsMade") === i) {
      cliExecute("camp dnapotion");
    }
    i = i + 1;
  }

  return false;
}

export function dna_sorceressTest(): boolean {
  // FIXME: Can we do this earlier? This isn't even all that useful, to be fair.
  // When is the last time we encounter each of these types?
  if (!DNALab.installed()) {
    return false;
  }
  if (safeGet("dnaSyringe") === $phylum.none) {
    return false;
  }
  if (myLevel() < 13) {
    return false;
  }
  if (get("_dnaPotionsMade") >= 3) {
    return false;
  }
  if (toInt(get("choiceAdventure1003")) < 3) {
    return false;
  }
  if (get("nsChallenge2") === "" && get("telescopeUpgrades") >= 2) {
    ns_crowd3();
  }

  if (
    safeGet("dnaSyringe") === $phylum`plant` &&
    get("nsChallenge2") === $element`cold`.toString() &&
    itemAmount($item`Gene Tonic: Plant`) === 0
  ) {
    cliExecute("camp dnainject");
  } else if (
    safeGet("dnaSyringe") === $phylum`demon` &&
    get("nsChallenge2") === $element`hot`.toString() &&
    itemAmount($item`Gene Tonic: Demon`) === 0
  ) {
    cliExecute("camp dnainject");
  } else if (
    safeGet("dnaSyringe") === $phylum`slime` &&
    get("nsChallenge2") === $element`sleaze`.toString() &&
    itemAmount($item`Gene Tonic: Slime`) === 0
  ) {
    cliExecute("camp dnainject");
  } else if (
    safeGet("dnaSyringe") === $phylum`undead` &&
    get("nsChallenge2") === $element`spooky`.toString() &&
    itemAmount($item`Gene Tonic: Undead`) === 0
  ) {
    cliExecute("camp dnainject");
  } else if (
    safeGet("dnaSyringe") === $phylum`hobo` &&
    get("nsChallenge2") === $element`stench`.toString() &&
    itemAmount($item`Gene Tonic: Hobo`) === 0
  ) {
    cliExecute("camp dnainject");
  }

  return false;
}

export function dna_bedtime(): boolean {
  if (!isUnrestricted($item`Little Geneticist DNA-Splicing Lab`)) {
    return false;
  }
  if (safeGet("dnaSyringe") === $phylum.none) {
    return false;
  }
  if ($item`Little Geneticist DNA-Splicing Lab`.toString() in getCampground()) {
    let potionsMade: number = get("_dnaPotionsMade");
    while (potionsMade < 3) {
      cliExecute("camp dnapotion");
      potionsMade += 1;
    }
  }
  return false;
}
