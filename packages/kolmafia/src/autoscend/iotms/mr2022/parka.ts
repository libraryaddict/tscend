import { cliExecute, containsText, equip, haveEquipped, Item } from "kolmafia";
import { $item, get, set } from "libram";

import { possessEquipment } from "../../auto_equipment";
import { auto_is_valid, hasTorso, wrap_item } from "../../auto_util";
import { maximizer } from "../../utils/maximizer";

export function auto_hasParka(): boolean {
  const parka: Item = wrap_item($item`Jurassic Parka`);
  return possessEquipment(parka) && auto_is_valid(parka);
}

export function auto_configureParka(tag: string): boolean {
  if (!auto_hasParka() || !hasTorso()) {
    return false;
  }
  // store the requested setting in a property so we can handle them later
  set("auto_parkaSetting", tag);
  // cut down potential server hits by telling the maximizer to not consider it.
  maximizer.exclude(wrap_item($item`Jurassic Parka`));
  return true;
}

export function auto_handleParka(): boolean {
  if (!auto_hasParka() || !hasTorso()) {
    return false;
  }
  const dino: string = get("auto_parkaSetting");
  let tempDino: string = dino;
  if (dino === "") {
    if (get("parkaMode") === "") {
      // if currently configured for stats and have been getting beaten up, change to stun
      tempDino = "kachungasaur";
    } else {
      return false;
    }
  }
  if (
    !containsText(
      "kachungasaur | cold | hp | meat | dilophosaur | stench | acid | ghostasaurus | spooky | mp | dr | spikolodon | sleaze | ml | spikes | pterodactyl | hot | init | nc",
      dino,
    )
  ) {
    return false;
  }
  if (dino === "cold" || dino === "meat" || dino === "hp") {
    tempDino = "kachungasaur";
  } else if (dino === "stench" || dino === "acid") {
    tempDino = "dilophosaur";
  } else if (dino === "spooky" || dino === "mp" || dino === "dr") {
    tempDino = "ghostsaurus";
  } else if (dino === "sleaze" || dino === "ml" || dino === "spikes") {
    tempDino = "spikolodon";
  } else if (dino === "hot" || dino === "init" || dino === "nc") {
    tempDino = "pterodactyl";
  }
  // avoid uselessly reconfiguring the parka
  if (get("parkaMode") !== tempDino) {
    cliExecute(`parka ${tempDino}`);
  }
  const parka: Item = wrap_item($item`Jurassic Parka`);
  equip(parka); // already configured, just equip

  return get("parkaMode") === tempDino && haveEquipped(parka);
}

export function auto_ParkaSpikeForcesLeft(): number {
  if (!auto_hasParka()) {
    return 0;
  }
  const spike_uses: number = get("_spikolodonSpikeUses");
  return 5 - spike_uses;
}
