import {
  Element,
  itemAmount,
  myHash,
  Stat,
  toInt,
  toItem,
  visitUrl,
} from "kolmafia";
import { $element, $item, $stat } from "libram";

import { possessEquipment } from "../../auto_equipment";
import { auto_is_valid, auto_log_warning } from "../../auto_util";

export function pantogramPants(
  st: Stat,
  el: Element,
  hpmp: number,
  meatItemStats: number,
  misc: number,
): boolean {
  if (!auto_is_valid($item`portable pantogram`)) {
    return false;
  }
  if (itemAmount($item`portable pantogram`) === 0) {
    return false;
  }
  if (possessEquipment($item`pantogram pants`)) {
    return false;
  }
  let m: number = 0;
  switch (st) {
    case $stat`Muscle`:
      m = 1;
      break;
    case $stat`Mysticality`:
      m = 2;
      break;
    case $stat`Moxie`:
      m = 3;
      break;
  }

  let e: number = 0;
  switch (el) {
    case $element`hot`:
      e = 1;
      break;
    case $element`cold`:
      e = 2;
      break;
    case $element`spooky`:
      e = 3;
      break;
    case $element`sleaze`:
      e = 4;
      break;
    case $element`stench`:
      e = 5;
      break;
  }

  if (hpmp < 1 || hpmp > 9) {
    auto_log_warning(
      "Invalid BottomLeft specifier for pANts. Failing pANts.",
      "red",
    );
    return false;
  }
  if (meatItemStats < 1 || meatItemStats > 12) {
    auto_log_warning(
      "Invalid BottomRight specifier for pANts. Failing pANts.",
      "red",
    );
    return false;
  }
  if (misc < 1 || misc > 11) {
    auto_log_warning(
      "Invalid BottomMiddle specifier for pANts. Failing pANts.",
      "red",
    );
    return false;
  }

  let itemId: number = 0;
  let itemQty: number = 0;
  switch (hpmp) {
    case 1:
      itemId = -1;
      itemQty = 0;
      break;
    case 2:
      itemId = -2;
      itemQty = 0;
      break;
    case 3:
      itemId = 464;
      itemQty = 1;
      break;
    case 4:
      itemId = 830;
      itemQty = 1;
      break;
    case 5:
      itemId = 2438;
      itemQty = 1;
      break;
    case 6:
      itemId = 1658;
      itemQty = 1;
      break;
    case 7:
      itemId = 5789;
      itemQty = 1;
      break;
    case 8:
      itemId = 8455;
      itemQty = 1;
      break;
    case 9:
      itemId = 705;
      itemQty = 1;
      break;
  }

  if (itemAmount(toItem(itemId)) < itemQty) {
    auto_log_warning(`Do not have enough: ${toItem(itemId)} for pANts.`, "red");
    return false;
  }
  const s1: string = `${itemId},${itemQty}`;

  switch (meatItemStats) {
    case 1:
      itemId = -1;
      itemQty = 0;
      break;
    case 2:
      itemId = -2;
      itemQty = 0;
      break;
    case 3:
      itemId = 173;
      itemQty = 1;
      break;
    case 4:
      itemId = 706;
      itemQty = 1;
      break;
    case 5:
      itemId = 80;
      itemQty = 1;
      break;
    case 6:
      itemId = 7338;
      itemQty = 1;
      break;
    case 7:
      itemId = 747;
      itemQty = 3;
      break;
    case 8:
      itemId = 559;
      itemQty = 3;
      break;
    case 9:
      itemId = 27;
      itemQty = 3;
      break;
    case 10:
      itemId = 7327;
      itemQty = 5;
      break;
    case 11:
      itemId = 7324;
      itemQty = 5;
      break;
    case 12:
      itemId = 7330;
      itemQty = 5;
      break;
  }

  if (itemAmount(toItem(itemId)) < itemQty) {
    auto_log_warning(`Do not have enough: ${toItem(itemId)} for pANts.`, "red");
    return false;
  }
  const s2: string = `${itemId},${itemQty}`;

  switch (misc) {
    case 1:
      itemId = -1;
      itemQty = 0;
      break;
    case 2:
      itemId = -2;
      itemQty = 0;
      break;
    case 3:
      itemId = 70;
      itemQty = 1;
      break;
    case 4:
      itemId = 704;
      itemQty = 1;
      break;
    case 5:
      itemId = 865;
      itemQty = 11;
      break;
    case 6:
      itemId = 6851;
      itemQty = 1;
      break;
    case 7:
      itemId = 3495;
      itemQty = 11;
      break;
    case 8:
      itemId = 9008;
      itemQty = 1;
      break;
    case 9:
      itemId = 1907;
      itemQty = 15;
      break;
    case 10:
      itemId = 14;
      itemQty = 99;
      break;
    case 11:
      itemId = 24;
      itemQty = 1;
      break;
  }

  if (itemAmount(toItem(itemId)) < itemQty) {
    auto_log_warning(`Do not have enough: ${toItem(itemId)} for pANts.`, "red");
    return false;
  }
  const s3: string = `${itemId},${itemQty}`;

  if (m < 1 || m > 3) {
    auto_log_warning("Invalid stat specifier for pANts. Failing pANts.", "red");
    return false;
  }
  if (e < 1 || e > 5) {
    auto_log_warning(
      "Invalid elemental specifier for pANts. Failing pANts.",
      "red",
    );
    return false;
  }

  visitUrl(
    `inv_use.php?pwd=${myHash()}&which=3&whichitem=${toInt($item`portable pantogram`)}`,
  );
  //<tr><td style="color: white;" align=center bgcolor=blue><b>Results:</b></td></tr><tr><td style="padding: 5px; border: 1px solid blue;"><center><table><tr><td><span class='guts'>Something went awry.</span></td></tr>

  visitUrl(
    `choice.php?pwd=&whichchoice=1270&option=1&m=${m}&e=${e}&s1=${s1}&s2=${s2}&s3=${s3}`,
  );
  return true;
}
