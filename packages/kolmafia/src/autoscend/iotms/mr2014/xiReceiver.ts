import {
  create,
  handlingChoice,
  inHardcore,
  itemAmount,
  lastChoice,
  myAdventures,
  myDaycount,
  myHash,
  myLevel,
  storageAmount,
  visitUrl,
} from "kolmafia";
import { $familiar, $item, $location, get, set } from "libram";

import { canPull, pullXWhenHaveY } from "../../auto_acquire";
import { autoAdv } from "../../auto_adventure";
import { handleChoiceAdv } from "../../auto_choice_adv";
import { fullness_left, inebriety_left } from "../../auto_consume";
import { possessEquipment } from "../../auto_equipment";
import { canChangeToFamiliar } from "../../auto_familiar";
import { isAboutToPowerlevel } from "../../auto_powerlevel";
import {
  auto_abort,
  auto_can_equip,
  auto_is_valid,
  auto_log_info,
  internalQuestStatus,
} from "../../auto_util";
import { in_robot } from "../../paths/2021/you_robot";

export function LX_ornateDowsingRod(
  doing_desert_now: boolean = false,
): boolean {
  if (!get("auto_grimstoneOrnateDowsingRod", false)) {
    return false;
  }
  if (
    get("desertExploration") >= 100 ||
    internalQuestStatus("questL11Desert") > 0
  ) {
    // don't need a dowsing rod if we've finished the desert.
    return false;
  }
  if (!auto_is_valid($item`grimstone mask`)) {
    return false;
  }
  if (!auto_can_equip($item`ornate dowsing rod`) && !in_robot()) {
    return false;
  }
  if (possessEquipment($item`ornate dowsing rod`)) {
    return false;
  }
  if (possessEquipment($item`UV-resistant compass`)) {
    return false; //already chose the other off-hand
  }
  if (inHardcore()) {
    //will we be able to pull at any point in the run. not just right now (we might be out of pulls today)
    if (!canChangeToFamiliar($familiar`Grimstone Golem`)) {
      //no golem, or not allowed in path
      set("auto_grimstoneOrnateDowsingRod", false);
      return false;
    }
  }
  //because it requires continuous adventures in the same day, then we want to do pre do this before we even get to the desert.
  //but we do not want to do it too early either. so we wait until we are at least day 2 and level 7 to get the dowsing rod.
  //unless we are doing desert now. in which case we ignore this limitation and do it now
  if (!doing_desert_now && (myLevel() < 8 || myDaycount() < 2)) {
    return false;
  }

  if (
    itemAmount($item`grimstone mask`) === 0 &&
    !canChangeToFamiliar($familiar`Grimstone Golem`) &&
    canPull($item`grimstone mask`)
  ) {
    if (
      canPull($item`Shore Inc. Ship Trip Scrip`) &&
      storageAmount($item`Shore Inc. Ship Trip Scrip`) > 2
    ) {
      //since drum machine and killing jar get pulled it's not useful to explore faster than compass just to need more fights gathering pages anyway
      //not worth spending the 5 adv to acquire rod in addition to the pull if Trip Scrip aren't in short supply
      return false;
    }
    // if(canChangeToFamiliar($familiar[Melodramedary]))
    // {
    // 	//with Melodramedary, drum machine, killing jar and no Scrip pull, pulling the mask saves 2 turns compared to vacationing for Scrip? is that good enough?
    // }
    pullXWhenHaveY($item`grimstone mask`, 1, 0); //pull the mask if you do not have it and cannot use the golem
  }
  if (itemAmount($item`grimstone mask`) === 0) {
    return false;
  }

  if (myAdventures() <= 6) {
    auto_log_info(
      `I need at least 6 adv to get [Ornate Dowsing Rod] and I only have ${myAdventures()}`,
      "blue",
    );
    if (doing_desert_now) {
      if (fullness_left() + inebriety_left() > 0) {
        auto_abort(
          "I am trying to do desert now so I cannot delay getting [Ornate Dowsing Rod]. I still have stomch and and liver left. Eat and drink until at least 6 adv and then run me again",
        );
      }
      if (isAboutToPowerlevel()) {
        auto_log_info(
          "I have nothing else to do except the desert. So I am ending the day early",
          "blue",
        );
        set("_auto_doneToday", true);
        return true; //want to restart the loop so it can properly exit it and do bedtime.
      }
    }
    return false;
  }

  auto_log_info("Acquiring a Dowsing Rod!", "blue");
  // use() aborts the whole script with "Unsupported choice adventure #829"
  // since this redirects straight into choice.php; visitUrl() bypasses that and
  // lets the real choice dispatcher handle it instead.
  const maskText = visitUrl(
    `inv_use.php?pwd=${myHash()}&which=3&whichitem=${$item`grimstone mask`.id}`,
  );
  if (handlingChoice()) {
    handleChoiceAdv(lastChoice(), maskText);
  }

  while (itemAmount($item`odd silver coin`) < 1) {
    autoAdv($location`The Prince's Balcony`);
  }
  while (itemAmount($item`odd silver coin`) < 2) {
    autoAdv($location`The Prince's Dance Floor`);
  }
  while (itemAmount($item`odd silver coin`) < 3) {
    autoAdv($location`The Prince's Lounge`);
  }
  while (itemAmount($item`odd silver coin`) < 4) {
    autoAdv($location`The Prince's Kitchen`);
  }
  while (itemAmount($item`odd silver coin`) < 5) {
    autoAdv($location`The Prince's Restroom`);
  }

  if (create(1, $item`ornate dowsing rod`)) {
    return true;
  }
  if (itemAmount($item`ornate dowsing rod`) === 0) {
    auto_abort(
      "Failed to craft [Ornate Dowsing Rod]. craft it manually and run me again",
    );
  }
  return false;
}
