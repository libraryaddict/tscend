import { inHardcore } from "kolmafia";

import { Lsc_flyerSeals, LX_burnDelay } from "../autoscend";
import { auto_breakfastCounterVisit } from "./auto_consume";
import { LX_attemptPowerLevel, LX_freeCombatsTask } from "./auto_powerlevel";
import {
  auto_earlyRoutingHandling,
  auto_softBlockHandler,
} from "./auto_routing";
import { LX_summonMonster, woods_questStart } from "./auto_util";
import { handleRainDoh } from "./iotms/mr2012";
import { fancyOilPainting, LX_ornateDowsingRod } from "./iotms/mr2014";
import { chateauPainting, resolveSixthDMT } from "./iotms/mr2015";
import { catBurglarHeist } from "./iotms/mr2018";
import { LX_unlockPirateRealm } from "./iotms/mr2019";
import { LM_edTheUndying } from "./paths/actually_ed_the_undying";
import {
  LX_attemptPowerLevelMeat,
  LX_needMeatSkills,
} from "./paths/adventurer_meats_world";
import { LM_avantGuard } from "./paths/avant_guard";
import { LM_jarlsberg } from "./paths/avatar_of_jarlsberg";
import {
  LX_bugbearInvasion,
  LX_bugbearInvasionFinale,
} from "./paths/bugbear_invasion";
import { LX_koeInvaderHandler } from "./paths/kingdom_of_exploathing";
import { LX_lowkeySummer } from "./paths/low_key_summer";
import { LX_quantumTerrarium } from "./paths/quantum_terrarium";
import {
  is_professor,
  is_werewolf,
  LM_wereprof,
  LX_wereprof_getSmashedEquip,
} from "./paths/wereprofessor";
import { LM_zombieSlayer } from "./paths/zombie_slayer";
import { L2_mosquito } from "./quests/level_02";
import { L3_tavern } from "./quests/level_03";
import { L4_batCave } from "./quests/level_04";
import {
  L5_findKnob,
  L5_getEncryptionKey,
  L5_slayTheGoblinKing,
} from "./quests/level_05";
import {
  L6_dakotaFanning,
  L6_friarsGetParts,
  L6_friarsGetParts_condition_hardcore,
} from "./quests/level_06";
import { L7_crypt } from "./quests/level_07";
import { L8_trapperGroar, L8_trapperQuest } from "./quests/level_08";
import {
  finishBuildingSmutOrcBridge,
  L9_aBooPeak,
  L9_chasmBuild,
  L9_highLandlord,
  L9_leafletQuest,
  L9_oilPeak,
  LX_loggingHatchet,
} from "./quests/level_09";
import {
  L10_airship,
  L10_basement,
  L10_ground,
  L10_holeInTheSkyUnlock,
  L10_plantThatBean,
  L10_rainOnThePlains,
  L10_topFloor,
} from "./quests/level_10";
import {
  L11_aridDesert,
  L11_blackMarket,
  L11_defeatEd,
  L11_forgedDocuments,
  L11_getBeehive,
  L11_getUVCompass,
  L11_hasUltrahydrated,
  L11_hiddenCity,
  L11_hiddenCityZones,
  L11_mauriceSpookyraven,
  L11_mcmuffinDiary,
  L11_palindome,
  L11_shenCopperhead,
  L11_shenStartQuest,
  L11_talismanOfNam,
  L11_unlockEd,
  L11_unlockHiddenCity,
  L11_unlockPyramid,
  LX_spookyravenManorFirstFloor,
  LX_spookyravenManorSecondFloor,
  LX_unlockHiddenTemple,
} from "./quests/level_11";
import {
  L12_clearBattlefield,
  L12_farm,
  L12_filthworms,
  L12_finalizeWar,
  L12_flyerBackup,
  L12_flyerFinish,
  L12_getOutfit,
  L12_gremlins,
  L12_islandWar,
  L12_lastDitchFlyer,
  L12_opportunisticWarStart,
  L12_orchardFinalize,
  L12_preOutfit,
  L12_sonofaBeach,
  L12_sonofaFinish,
  L12_sonofaPrefix,
  L12_startWar,
  L12_themtharHills,
} from "./quests/level_12";
import {
  L13_sorceressDoor,
  L13_towerAscent,
  L13_towerNSContests,
  L13_towerNSFinal,
  L13_towerNSHedge,
  L13_towerNSNagamar,
  L13_towerNSTower,
  LX_getDigitalKey,
  LX_getStarKey,
} from "./quests/level_13";
import {
  LX_bitchinMeatcar,
  LX_bitchinMeatcar_condition,
  LX_fatLootToken,
  LX_islandAccess,
  LX_lastChance,
  LX_lockPicking,
  LX_setWorkshed,
  LX_unlockDesert,
} from "./quests/level_any";
import {
  LX_galaktikSubQuest,
  LX_guildUnlock,
  LX_steelOrgan,
  LX_steelOrgan_condition_slow,
} from "./quests/optional";

const taskFunctionRegistry: Record<string, () => boolean> = {
  auto_breakfastCounterVisit,
  auto_earlyRoutingHandling,
  auto_softBlockHandler,
  catBurglarHeist,
  chateauPainting,
  fancyOilPainting,
  finishBuildingSmutOrcBridge,
  handleRainDoh,
  is_professor,
  is_werewolf,
  L10_airship,
  L10_basement,
  L10_ground,
  L10_holeInTheSkyUnlock,
  L10_plantThatBean,
  L10_rainOnThePlains,
  L10_topFloor,
  L11_aridDesert,
  L11_blackMarket,
  L11_defeatEd,
  L11_forgedDocuments,
  L11_getBeehive,
  L11_getUVCompass,
  L11_hasUltrahydrated,
  L11_hiddenCity,
  L11_hiddenCityZones,
  L11_mauriceSpookyraven,
  L11_mcmuffinDiary,
  L11_palindome,
  L11_shenCopperhead,
  L11_shenStartQuest,
  L11_talismanOfNam,
  L11_unlockEd,
  L11_unlockHiddenCity,
  L11_unlockPyramid,
  L12_clearBattlefield,
  L12_farm,
  L12_filthworms,
  L12_finalizeWar,
  L12_flyerBackup,
  L12_flyerFinish,
  L12_getOutfit,
  L12_gremlins,
  L12_islandWar,
  L12_lastDitchFlyer,
  L12_opportunisticWarStart,
  L12_orchardFinalize,
  L12_preOutfit,
  L12_sonofaBeach,
  L12_sonofaFinish,
  L12_sonofaPrefix,
  L12_startWar,
  L12_themtharHills,
  L13_sorceressDoor,
  L13_towerAscent,
  L13_towerNSContests,
  L13_towerNSFinal,
  L13_towerNSHedge,
  L13_towerNSNagamar,
  L13_towerNSTower,
  L2_mosquito,
  L3_tavern,
  L4_batCave,
  L5_findKnob,
  L5_getEncryptionKey,
  L5_slayTheGoblinKing,
  L6_dakotaFanning,
  L6_friarsGetParts,
  L6_friarsGetParts_condition_hardcore,
  L7_crypt,
  L8_trapperGroar,
  L8_trapperQuest,
  L9_aBooPeak,
  L9_chasmBuild,
  L9_highLandlord,
  L9_leafletQuest,
  L9_oilPeak,
  LM_avantGuard,
  LM_edTheUndying,
  LM_jarlsberg,
  LM_wereprof,
  LM_zombieSlayer,
  Lsc_flyerSeals,
  LX_attemptPowerLevel,
  LX_attemptPowerLevelMeat,
  LX_bitchinMeatcar,
  LX_bitchinMeatcar_condition,
  LX_bugbearInvasion,
  LX_bugbearInvasionFinale,
  LX_burnDelay,
  LX_fatLootToken,
  LX_freeCombatsTask,
  LX_galaktikSubQuest,
  LX_getDigitalKey,
  LX_getStarKey,
  LX_guildUnlock,
  LX_islandAccess,
  LX_koeInvaderHandler,
  LX_lastChance,
  LX_lockPicking,
  LX_loggingHatchet,
  LX_lowkeySummer,
  LX_needMeatSkills,
  LX_ornateDowsingRod,
  LX_quantumTerrarium,
  LX_setWorkshed,
  LX_spookyravenManorFirstFloor,
  LX_spookyravenManorSecondFloor,
  LX_steelOrgan,
  LX_steelOrgan_condition_slow,
  LX_summonMonster,
  LX_unlockDesert,
  LX_unlockHiddenTemple,
  LX_unlockPirateRealm,
  LX_wereprof_getSmashedEquip,
  in_hardcore: inHardcore,
  resolveSixthDMT,
  woods_questStart,
};

export function callRegisteredTaskFunction(name: string): boolean {
  const fn = taskFunctionRegistry[name];
  if (!fn) {
    throw `Task "${name}" is not registered in task registry.`;
  }
  return fn();
}
