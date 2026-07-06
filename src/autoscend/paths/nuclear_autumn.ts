import {
  getProperty,
  haveSkill,
  itemAmount,
  myDaycount,
  myPath,
  setProperty,
  toBoolean,
  toInt,
  use,
  visitUrl,
} from "kolmafia";
import { $item, $path, $skill } from "libram";

import { acquireHermitItem, pullXWhenHaveY } from "../auto_acquire";
import { equipBaseline } from "../auto_equipment";
import { ovenHandle } from "../auto_util";
import { auto_sourceTerminalRequest } from "../iotms/mr2016";

//Defined in autoscend/paths/nuclear_autumn.ash
export function in_nuclear(): boolean {
  return myPath() === $path`Nuclear Autumn`;
}

export function nuclear_initializeSettings(): void {
  if (in_nuclear()) {
    setProperty("auto_getBeehive", true.toString());
  }
}

export function nuclear_initializeDay(day: number): void {
  if (!in_nuclear()) {
    return;
  }

  if (
    !toBoolean(getProperty("falloutShelterChronoUsed")) &&
    toInt(getProperty("falloutShelterLevel")) >= 6
  ) {
    const temp: string = visitUrl(
      "place.php?whichplace=falloutshelter&action=vault5",
    );
  }

  if (
    !toBoolean(getProperty("falloutShelterCoolingTankUsed")) &&
    toInt(getProperty("falloutShelterLevel")) >= 8
  ) {
  }

  if (myDaycount() % 2 === 1) {
    auto_sourceTerminalRequest("enquiry stats.enq");
  } else {
    auto_sourceTerminalRequest("enquiry familiar.enq");
  }

  if (day === 2) {
    equipBaseline();
    ovenHandle();

    if (toInt(getProperty("auto_day_init")) < 2) {
      if (itemAmount($item`gym membership card`) > 0) {
        use(1, $item`gym membership card`);
      }

      if (itemAmount($item`seal tooth`) === 0) {
        acquireHermitItem($item`seal tooth`);
      }
      while (acquireHermitItem($item`11-leaf clover`)) {}
      pullXWhenHaveY($item`Hand in Glove`, 1, 0);
      pullXWhenHaveY($item`blackberry galoshes`, 1, 0);
    }
  } else if (day === 3) {
    if (toInt(getProperty("auto_day_init")) < 3) {
      while (acquireHermitItem($item`11-leaf clover`)) {}
      setProperty("auto_day_init", (3).toString());
    }
  } else if (day === 4) {
    if (toInt(getProperty("auto_day_init")) < 4) {
      while (acquireHermitItem($item`11-leaf clover`)) {}
      setProperty("auto_day_init", (4).toString());
    }
  }
}

function nuclear_buySkills(): boolean {
  if (!in_nuclear()) {
    return false;
  }

  if (itemAmount($item`rad`) < 30) {
    return false;
  }

  if (haveSkill($skill`Internal Soda Machine`)) {
    return false;
  }

  let toBuy: number = 0;
  /*
22012 Boiling Tear Ducts  doublewater.gif 5   10  0				30		Hot Damage
22013 Throat Refrigerant  snowflake.gif   5   10  0				30		Cold Damage
22014 Skunk Glands    stench.gif  5   10  0						30		Stench Damage
22015 Translucent Skin    glass.gif   5   10  0					30		Spooky Damage
22016 Projectile Salivary Glands  raindrop.gif    5   10  0		30		Combat Damage?
22017 Mind Bullets    sixshooter.gif  5   15  0					60		Stunner
22019 Metallic Skin   pittedmetal.gif 0   0   0					90		+2 all res
22020 Adipose Polymers    glueglob.gif    0   0   0				90		+100 DA, +10 DR
22021 Extra Muscles   strboost.gif    0   0   0					90		Muscle +50%
22022 Extra Brain birdbrain.gif   0   0   0						90		Myst +50%
22023 Hypno-Eyes  spiral.gif  0   0   0							90		Moxie +50%
22027 Flappy Ears spiral.gif  3   30  10						60		30 MP: 10 adv of Ear Winds: +2 all res
22028 Magic Sweat sebashield.gif  3   30  10					60		30 MP: 10 adv of Hardened Sweatshirt: +100 DA, +10 DR
22029 Steroid Bladder eggsac.gif  3   30  10					60		30 MP: 10 adv of Juiced and Loose: +50% Muscle
22030 Intracranial Eye    eyeball.gif 3   30  10				60		30 MP: 10 adv of Mind Vision: +50% Myst
22031 Self-Combing Hair   toupee.gif  3   30  10				60		30 MP: 10 adv of Impeccable Coiffure: +50% Moxie
22037 Extra Gall Bladder  bladder.gif 0   0   0					60		Food +100% adventures
22038 Extra Kidney    kidney.gif  0   0   0						60		Booze +100% adventuree
22039 Internal Soda Machine   cloaca.gif  2   0   0				30		20 Meat -> 10 MP
22024 Backwards Knees knee.gif 0 0 0 							120		Passive +20 init
22025 Sucker Fingers plunger.gif 0 0 0							120		Passive +15 item
22032 Bone Springs spring.gif 3 30 10 							90		Noncombat (30): 10 adv of Bone Springs: +20 Init
22033 Magnetic Ears ears.gif 3 10 20 							90		Noncombat (10): 20 adv of Magnetized Ears: +15 Item
22034 Firefly Abdomen bulb.gif 3 30 10 							90		Noncombat (30): 10 adv of Blinking Belly: +10/15 C
22035 Squid Glands inkwell.gif 3 30 10 							90		Noncombat (30): 10 adv of Inked Well: +10/15 NC
22036 Extremely Punchable Face wink.gif 3 30 10 				90		Noncombat (30): 10 adv pf Punchable Face: +30 ML
Missing: 858, 866
*/
  if (!haveSkill($skill`Extra Gall Bladder`) && toBuy === 0) {
    if (itemAmount($item`rad`) >= 60) {
      toBuy = 877;
    }
  } else if (!haveSkill($skill`Extra Kidney`) && toBuy === 0) {
    if (itemAmount($item`rad`) >= 60) {
      toBuy = 878;
    }
  } else if (!haveSkill($skill`Extra Muscles`) && toBuy === 0) {
    if (itemAmount($item`rad`) >= 90) {
      toBuy = 861;
    }
  } else if (
    !haveSkill($skill`Magnetic Ears`) &&
    toBuy === 0 &&
    toInt(getProperty("falloutShelterLevel")) >= 6
  ) {
    if (itemAmount($item`rad`) >= 90) {
      toBuy = 873;
    }
  } else if (!haveSkill($skill`Hypno-Eyes`) && toBuy === 0) {
    if (itemAmount($item`rad`) >= 90) {
      toBuy = 863;
    }
  } else if (!haveSkill($skill`Metallic Skin`) && toBuy === 0) {
    if (itemAmount($item`rad`) >= 90) {
      toBuy = 859;
    }
  } else if (!haveSkill($skill`Adipose Polymers`) && toBuy === 0) {
    if (itemAmount($item`rad`) >= 90) {
      toBuy = 860;
    }
  } else if (
    !haveSkill($skill`Sucker Fingers`) &&
    toBuy === 0 &&
    toInt(getProperty("falloutShelterLevel")) >= 6
  ) {
    if (itemAmount($item`rad`) >= 120) {
      toBuy = 865;
    }
  } else if (
    !haveSkill($skill`Squid Glands`) &&
    toBuy === 0 &&
    toInt(getProperty("falloutShelterLevel")) >= 6
  ) {
    if (itemAmount($item`rad`) >= 120) {
      toBuy = 875;
    }
  } else if (!haveSkill($skill`Steroid Bladder`) && toBuy === 0) {
    if (itemAmount($item`rad`) >= 60) {
      toBuy = 869;
    }
  } else if (!haveSkill($skill`Self-Combing Hair`) && toBuy === 0) {
    if (itemAmount($item`rad`) >= 60) {
      toBuy = 871;
    }
  } else if (!haveSkill($skill`Flappy Ears`) && toBuy === 0) {
    if (itemAmount($item`rad`) >= 60) {
      toBuy = 867;
    }
  } else if (!haveSkill($skill`Magic Sweat`) && toBuy === 0) {
    if (itemAmount($item`rad`) >= 60) {
      toBuy = 868;
    }
  } else if (!haveSkill($skill`Mind Bullets`) && toBuy === 0) {
    if (itemAmount($item`rad`) >= 60) {
      toBuy = 857;
    }
  } else if (!haveSkill($skill`Extra Brain`) && toBuy === 0) {
    if (itemAmount($item`rad`) >= 90) {
      toBuy = 862;
    }
  } else if (!haveSkill($skill`Intracranial Eye`) && toBuy === 0) {
    if (itemAmount($item`rad`) >= 60) {
      toBuy = 870;
    }
  } else if (!haveSkill($skill`Boiling Tear Ducts`) && toBuy === 0) {
    if (itemAmount($item`rad`) >= 30) {
      toBuy = 852;
    }
  } else if (!haveSkill($skill`Throat Refrigerant`) && toBuy === 0) {
    if (itemAmount($item`rad`) >= 30) {
      toBuy = 853;
    }
  } else if (
    !haveSkill($skill`Extremely Punchable Face`) &&
    toBuy === 0 &&
    toInt(getProperty("falloutShelterLevel")) >= 6
  ) {
    if (itemAmount($item`rad`) >= 90) {
      toBuy = 876;
    }
  } else if (
    !haveSkill($skill`Firefly Abdomen`) &&
    toBuy === 0 &&
    toInt(getProperty("falloutShelterLevel")) >= 6
  ) {
    if (itemAmount($item`rad`) >= 90) {
      toBuy = 874;
    }
  } else if (
    !haveSkill($skill`Backwards Knees`) &&
    toBuy === 0 &&
    toInt(getProperty("falloutShelterLevel")) >= 6
  ) {
    if (itemAmount($item`rad`) >= 120) {
      toBuy = 864;
    }
  } else if (
    !haveSkill($skill`Bone Springs`) &&
    toBuy === 0 &&
    toInt(getProperty("falloutShelterLevel")) >= 6
  ) {
    if (itemAmount($item`rad`) >= 90) {
      toBuy = 872;
    }
  } else if (!haveSkill($skill`Skunk Glands`) && toBuy === 0) {
    if (itemAmount($item`rad`) >= 30) {
      toBuy = 854;
    }
  } else if (!haveSkill($skill`Translucent Skin`) && toBuy === 0) {
    if (itemAmount($item`rad`) >= 30) {
      toBuy = 855;
    }
  } else if (!haveSkill($skill`Projectile Salivary Glands`) && toBuy === 0) {
    if (itemAmount($item`rad`) >= 30) {
      toBuy = 856;
    }
  } else if (!haveSkill($skill`Internal Soda Machine`) && toBuy === 0) {
    if (itemAmount($item`rad`) >= 30) {
      toBuy = 879;
    }
  }

  if (toBuy !== 0) {
    let page: string = visitUrl("shop.php?whichshop=mutate");
    page = visitUrl(
      `shop.php?whichshop=mutate&action=buyitem&quantity=1&pwd=&whichrow=${toBuy}`,
    );
  }
  return true;
}

export function LM_nuclear(): boolean {
  if (!in_nuclear()) {
    return false;
  }

  nuclear_buySkills();

  return false;
}
