import { auto_log_error, LX_summonMonster, woods_questStart } from "./auto_util";
import { LX_burnDelay, Lsc_flyerSeals } from "./../autoscend";
import { auto_breakfastCounterVisit } from "./auto_consume";
import { LX_attemptPowerLevel, LX_freeCombatsTask } from "./auto_powerlevel";
import { allowSoftblockDelay, auto_earlyRoutingHandling, auto_softBlockHandler } from "./auto_routing";
import { handleRainDoh } from "./iotms/mr2012";
import {  LX_ornateDowsingRod, fancyOilPainting } from "./iotms/mr2014";
import { chateauPainting, resolveSixthDMT } from "./iotms/mr2015";
import { catBurglarHeist } from "./iotms/mr2018";
import { LX_unlockPirateRealm } from "./iotms/mr2019";
import { LM_edTheUndying } from "./paths/actually_ed_the_undying";
import { LM_jarlsberg } from "./paths/avatar_of_jarlsberg";
import { LX_bugbearInvasion, LX_bugbearInvasionFinale } from "./paths/bugbear_invasion";
import { LX_koeInvaderHandler } from "./paths/kingdom_of_exploathing";
import { LX_lowkeySummer } from "./paths/low_key_summer";
import { LX_quantumTerrarium } from "./paths/quantum_terrarium";
import { L2_mosquito } from "./quests/level_02";
import { L3_tavern } from "./quests/level_03";
import { L4_batCave } from "./quests/level_04";
import { L5_findKnob, L5_getEncryptionKey, L5_slayTheGoblinKing } from "./quests/level_05";
import { L6_dakotaFanning, L6_friarsGetParts, L6_friarsGetParts_condition_hardcore } from "./quests/level_06";
import { L7_crypt } from "./quests/level_07";
import { L8_trapperGroar, L8_trapperQuest } from "./quests/level_08";
import { finishBuildingSmutOrcBridge, L9_aBooPeak, L9_chasmBuild, L9_highLandlord, L9_leafletQuest, L9_oilPeak, LX_loggingHatchet } from "./quests/level_09";
import { L10_airship, L10_basement, L10_ground, L10_holeInTheSkyUnlock, L10_plantThatBean, L10_rainOnThePlains, L10_topFloor } from "./quests/level_10";
import { L11_aridDesert, L11_blackMarket, L11_defeatEd, L11_forgedDocuments, L11_getBeehive, L11_getUVCompass, L11_hasUltrahydrated, L11_hiddenCity, L11_hiddenCityZones, L11_mauriceSpookyraven, L11_mcmuffinDiary, L11_palindome, L11_shenCopperhead, L11_shenStartQuest, L11_talismanOfNam, L11_unlockEd, L11_unlockHiddenCity, L11_unlockPyramid, LX_spookyravenManorFirstFloor, LX_spookyravenManorSecondFloor, LX_unlockHiddenTemple } from "./quests/level_11";
import { L12_clearBattlefield, L12_farm, L12_filthworms, L12_finalizeWar, L12_flyerBackup, L12_flyerFinish, L12_getOutfit, L12_gremlins, L12_islandWar, L12_lastDitchFlyer, L12_opportunisticWarStart, L12_orchardFinalize, L12_preOutfit, L12_sonofaBeach, L12_sonofaFinish, L12_sonofaPrefix, L12_startWar, L12_themtharHills } from "./quests/level_12";
import { L13_sorceressDoor, L13_towerAscent, L13_towerNSContests, L13_towerNSFinal, L13_towerNSHedge, L13_towerNSNagamar, L13_towerNSTower, LX_getDigitalKey, LX_getStarKey } from "./quests/level_13";
import { LX_bitchinMeatcar, LX_bitchinMeatcar_condition, LX_fatLootToken, LX_islandAccess, LX_lastChance, LX_lockPicking, LX_setWorkshed, LX_unlockDesert } from "./quests/level_any";
import { LX_galaktikSubQuest, LX_guildUnlock, LX_steelOrgan, LX_steelOrgan_condition_slow } from "./quests/optional";
import { LX_attemptPowerLevelMeat, LX_needMeatSkills } from "./paths/adventurer_meats_world";
import { LM_avantGuard } from "./paths/avant_guard";
import { is_professor, is_werewolf, LM_wereprof, LX_wereprof_getSmashedEquip } from "./paths/wereprofessor";
import { LM_zombieSlayer } from "./paths/zombie_slayer";
import { inHardcore } from "kolmafia";

const taskFunctionRegistry: Record<string, () => boolean> = {
    LX_freeCombatsTask, woods_questStart, LX_unlockPirateRealm, catBurglarHeist,
auto_breakfastCounterVisit, chateauPainting, LX_setWorkshed, LX_galaktikSubQuest,
L9_leafletQuest, L5_findKnob, L12_sonofaPrefix, LX_burnDelay,
LX_summonMonster, L11_aridDesert, L11_shenStartQuest, finishBuildingSmutOrcBridge,
auto_earlyRoutingHandling, LX_guildUnlock, LX_unlockDesert, LX_lockPicking,
LX_fatLootToken, LX_steelOrgan, LX_spookyravenManorFirstFloor, L5_getEncryptionKey,
L12_islandWar, L11_blackMarket, L11_forgedDocuments, L11_mcmuffinDiary,
L11_getBeehive, L2_mosquito, LX_unlockHiddenTemple, L6_dakotaFanning,
L11_unlockHiddenCity, L11_hiddenCityZones, L11_hiddenCity, LX_spookyravenManorSecondFloor,
L11_mauriceSpookyraven, L11_talismanOfNam, L10_plantThatBean, L10_rainOnThePlains,
L9_chasmBuild, L9_highLandlord, L8_trapperQuest, L7_crypt,
L6_friarsGetParts, L11_palindome, L11_unlockPyramid, L11_unlockEd,
L11_defeatEd, L5_slayTheGoblinKing, L4_batCave, L3_tavern,
L13_towerAscent, LX_lastChance, auto_softBlockHandler, LX_attemptPowerLevel,
L12_opportunisticWarStart, LX_attemptPowerLevelMeat, LM_avantGuard, LX_koeInvaderHandler,
LM_jarlsberg, handleRainDoh, resolveSixthDMT, L12_flyerFinish,
L12_getOutfit, L12_startWar, LX_loggingHatchet, LX_bitchinMeatcar,
LX_islandAccess, fancyOilPainting, L12_preOutfit, L10_airship,
L10_basement, L10_ground, L10_topFloor, L10_holeInTheSkyUnlock,
L12_flyerBackup, Lsc_flyerSeals, LX_ornateDowsingRod, L12_gremlins,
L12_sonofaFinish, L12_sonofaBeach, L12_filthworms, L12_orchardFinalize,
L12_themtharHills, L12_farm, L12_finalizeWar, L12_clearBattlefield,
L12_lastDitchFlyer, LX_bugbearInvasionFinale, L13_towerNSContests, L13_towerNSHedge,
L13_sorceressDoor, L13_towerNSTower, L13_towerNSNagamar, L13_towerNSFinal,
LX_quantumTerrarium, LM_wereprof, LX_wereprof_getSmashedEquip,
L11_getUVCompass, L11_shenCopperhead, L9_aBooPeak, L9_oilPeak,
L8_trapperGroar, LX_getStarKey, LX_getDigitalKey, LM_zombieSlayer,
LM_edTheUndying, LX_bugbearInvasion, LX_lowkeySummer, L11_hasUltrahydrated, LX_needMeatSkills, LX_bitchinMeatcar_condition, LX_steelOrgan_condition_slow,
L6_friarsGetParts_condition_hardcore, "in_hardcore":inHardcore, is_werewolf, is_professor, allowSoftblockDelay};

function callRegisteredTask(name: string): boolean {
    const fn = taskFunctionRegistry[name];
    if (!fn) {
        throw `Task "${name}" is not registered in task registry.`;
    }
    return fn();
}

export { callRegisteredTask as callRegisteredTaskFunction };
