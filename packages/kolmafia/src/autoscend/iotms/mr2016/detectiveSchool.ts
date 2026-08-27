import {
  cliExecute,
  containsText,
  gitExists,
  isUnrestricted,
  replaceString,
  splitString,
  toInt,
  visitUrl,
} from "kolmafia";
import { $item, get, set } from "libram";

import { auto_log_info } from "../../auto_util";
import { AshMatcher } from "../../utils/kolmafiaUtils";

export function doPrecinct(): boolean {
  if (!isUnrestricted($item`detective school application`)) {
    return false;
  }
  if (!get("hasDetectiveSchool")) {
    return false;
  }
  if (get("_detectiveCasesCompleted") >= 3) {
    return false;
  }
  if (gitExists("Ezandora-Detective-Solver")) {
    //Assume if someone has this installed that they want to use it.
    cliExecute("ash import<Detective Solver.ash> solveAllCases(false);");
    return true;
  }

  if (get("auto_eggDetective") !== "") {
    set("auto_eggDetective", "");
  }

  let page: string = visitUrl(
    "place.php?whichplace=town_wrong&action=townwrong_precinct",
  );
  let eggMatcher: AshMatcher = new AshMatcher(
    "You have been on this case for (\\d+) minute(?:s?)",
    page,
  );
  if (!eggMatcher.find()) {
    if (!containsText(page, "The Precinct")) {
      return false;
    }

    let casesLeft: number = 0;
    const precinctMatcher: AshMatcher = new AshMatcher(
      "[(](\\d) more case(?:s?) today[)]",
      page,
    );
    if (precinctMatcher.find()) {
      casesLeft = toInt(precinctMatcher.group(1));
      auto_log_info(`We have ${casesLeft} case(s) leftover!`, "green");
    }

    if (casesLeft === 0) {
      page = visitUrl("wham.php", false);
      if (!containsText(page, "You have been on this case for")) {
        return false;
      }
      auto_log_info("Trying to resume case....", "red");
    }

    page = visitUrl("choice.php?pwd=&whichchoice=1193&option=1");
    eggMatcher = new AshMatcher(
      "You have been on this case for (\\d+) minute(?:s?)",
      page,
    );

    if (!containsText(page, "murdered with an egg")) {
      if (!eggMatcher.find()) {
        auto_log_info(
          `Someone was not murdered with an egg.... that's sad.${page}`,
          "red",
        );
        return false;
      }
    }
    auto_log_info("Murdered with an egg! I love Egg!!", "green");
    page = visitUrl("wham.php", false);
  }

  eggMatcher = new AshMatcher(
    "You have been on this case for (\\d+) minute(?:s?)",
    page,
  );
  if (!eggMatcher.find()) {
    auto_log_info("I can not resolve my case situation....", "red");
    return false;
  }

  while (!containsText(get("auto_eggDetective"), "solved")) {
    let eggData: Map<number, string> = new Map(
      splitString(get("auto_eggDetective"), ",").map((_v, _i) => [_i, _v]),
    );
    let i: number = 1;
    while (i <= 9) {
      let visited: boolean = false;
      for (const index of eggData.keys()) {
        const subEgg: Map<number, string> = new Map(
          splitString(eggData.get(index) ?? "", ":").map((_v, _i) => [_i, _v]),
        );
        if (toInt(subEgg.get(0) ?? "") === i) {
          visited = true;
          break;
        }
      }

      if (!visited) {
        auto_log_info(`Going to visit room: ${i}`, "green");
        page = visitUrl(`wham.php?visit=${i}`, false);
        const personMatcher: AshMatcher = new AshMatcher(
          '<td align=center width=200>(?:\\s+)<img src=["](?:[a-z0-9/_.:]+?)[.]gif["]>(?:\\s+)<br>(?:\\s+)<b>([a-zA-Z ]+?)</b>(?:\\s+?)<br>(?:\\s+?)([a-zA-Z -]+)(?:\\s+?)<p>(?:\\s+?)[(]([a-zA-Z \']+?)[)]',
          page,
        );
        if (personMatcher.find()) {
          const person: string = personMatcher.group(1);
          const job: string = personMatcher.group(2);
          const room: string = personMatcher.group(3);
          auto_log_info(`Found ${personMatcher.group(1)}`, "green");
          auto_log_info(`Found ${personMatcher.group(2)}`, "green");
          auto_log_info(`Found ${personMatcher.group(3)}`, "green");
          let generated: string = `${i}:${room}:${person}:${job}`;
          //Get killer response as well.
          page = visitUrl(`wham.php?ask=killer&visit=${i}`, false);
          const killerMatcher: AshMatcher = new AshMatcher(
            "you (?:ask|say)(?:.*?)<p>(.*?)(\\s*?)<!-- </div> -->",
            page,
          );
          if (killerMatcher.find()) {
            let killerInfo: string = killerMatcher.group(1);
            killerInfo = replaceString(killerInfo, ",", "");
            killerInfo = replaceString(killerInfo, ":", "");
            killerInfo = replaceString(killerInfo, "<p>", "");
            killerInfo = replaceString(killerInfo, "<i>", "");
            killerInfo = replaceString(killerInfo, "</i>", "");

            const nameSplit: Map<number, string> = new Map(
              splitString(person, " ").map((_v, _i) => [_i, _v]),
            );
            for (const index of nameSplit.keys()) {
              killerInfo = replaceString(
                killerInfo,
                nameSplit.get(index) ?? "",
                "",
              );
            }
            generated += `:${killerInfo}`;
          } else {
            auto_log_info(`Jerkwad '${person}' won't say anything!`, "blue");
            generated += ":liar";
          }
          set("auto_eggDetective", `${generated},${get("auto_eggDetective")}`);
        }
      }
      i += 1;
    }

    eggData = new Map(
      splitString(get("auto_eggDetective"), ",").map((_v, _i) => [_i, _v]),
    );
    auto_log_info("Generating goals...", "blue");
    //At this point we\'ve visited every place and queried everyone. Now we need to determine who is identifying a killer.
    //Extract names and jobs
    const personGoals: string[] = [];
    const jobGoals: string[] = [];
    const locationGoals: string[] = [];
    for (const index of eggData.keys()) {
      if ((eggData.get(index) ?? "") === "") {
        continue;
      }
      const subEgg: Map<number, string> = new Map(
        splitString(eggData.get(index) ?? "", ":").map((_v, _i) => [_i, _v]),
      );
      const person: string = subEgg.get(2) ?? "";
      if (!personGoals.includes(person)) {
        personGoals.push(person);
      }
      const job: string = subEgg.get(3) ?? "";
      if (!jobGoals.includes(job)) {
        jobGoals.push(job);
      }
      const location: string = subEgg.get(1) ?? "";
      if (!locationGoals.includes(location)) {
        locationGoals.push(location);
      }
    }

    auto_log_info("Verifications....", "blue");
    for (const index of eggData.keys()) {
      const subEgg: Map<number, string> = new Map(
        splitString(eggData.get(index) ?? "", ":").map((_v, _i) => [_i, _v]),
      );
      if (subEgg.size < 4) {
        continue;
      }
      let isTruth: boolean = true;
      if ((subEgg.get(4) ?? "") === "liar") {
        isTruth = false;
      }
      if ((subEgg.get(4) ?? "") !== "liar") {
        let hasAnyone: boolean = false;
        const oldValue: string = subEgg.get(4) ?? "";
        for (const goal of personGoals) {
          const goalMatcher: AshMatcher = new AshMatcher(
            `\\b${goal}\\b`,
            subEgg.get(4) ?? "",
          );
          if (goalMatcher.find()) {
            hasAnyone = true;
            subEgg.set(4, goal);
          }
        }
        for (const goal of jobGoals) {
          const goalMatcher: AshMatcher = new AshMatcher(
            `\\b${goal}\\b`,
            subEgg.get(4) ?? "",
          );
          if (goalMatcher.find()) {
            hasAnyone = true;
            subEgg.set(4, goal);
          }
        }
        let replaceString_1: string = "liar";
        if (hasAnyone) {
          replaceString_1 = subEgg.get(4) ?? "";
        }

        let temp: string = get("auto_eggDetective");
        temp = replaceString(temp, oldValue, replaceString_1);
        set("auto_eggDetective", temp);
        eggData = new Map(
          splitString(get("auto_eggDetective"), ",").map((_v, _i) => [_i, _v]),
        );
        subEgg.set(4, replaceString_1);
      }
      if ((subEgg.get(4) ?? "") !== "liar") {
        auto_log_info(
          `${subEgg.get(2) ?? ""} is accusing: ${subEgg.get(4) ?? ""}`,
          "blue",
        );
        //Now we need to determine if they are lying or not.
        const currentLocation: number = toInt(subEgg.get(0) ?? "");
        visitUrl(`wham.php?visit=${currentLocation}`, false);

        let otherPerson: number = 1;
        let corrupted: boolean = false;
        const locationName: string = subEgg.get(1) ?? "";
        while (otherPerson <= 9 && isTruth) {
          if (currentLocation === otherPerson) {
            otherPerson += 1;
            continue;
          }

          let currentEgg: Map<number, string> = new Map();
          for (const index_1 of eggData.keys()) {
            const subEgg_1: Map<number, string> = new Map(
              splitString(eggData.get(index_1) ?? "", ":").map((_v, _i) => [
                _i,
                _v,
              ]),
            );
            if (toInt(subEgg_1.get(0) ?? "") === otherPerson) {
              currentEgg = subEgg_1;
            }
          }

          page = visitUrl(
            `wham.php?ask=${otherPerson}&visit=${currentLocation}`,
            false,
          );
          const killerMatcher: AshMatcher = new AshMatcher(
            "you (?:ask|say)(?:.*?)<p>(.*?)(\\s*?)<!-- </div> -->",
            page,
          );
          if (killerMatcher.find()) {
            const killerInfo: string = killerMatcher.group(1);
            //We are asking to attach a job to the person. They might not know.
            //We need to look up the particular person.
            let exact: boolean = false;
            let count_1: number = 0;
            for (const goal of jobGoals) {
              const goalMatcher: AshMatcher = new AshMatcher(
                `\\b${goal}\\b`,
                killerInfo,
              );
              if (goalMatcher.find()) {
                if (goal !== (currentEgg.get(3) ?? "")) {
                  auto_log_info(
                    `Asked about ${currentEgg.get(2) ?? ""},${currentEgg.get(3) ?? ""} and was told: ${goal}`,
                    "red",
                  );
                  count_1 += 1;
                } else {
                  exact = true;
                }
              }
            }
            if (!exact && count_1 !== 0) {
              isTruth = false;
            }

            exact = false;
            count_1 = 0;
            for (const goal of locationGoals) {
              const goalMatcher: AshMatcher = new AshMatcher(
                `\\b${goal}\\b`,
                killerInfo,
              );
              if (goalMatcher.find()) {
                if (goal !== (currentEgg.get(1) ?? "")) {
                  auto_log_info(
                    `Asked about ${currentEgg.get(2) ?? ""},${currentEgg.get(1) ?? ""} and was told: ${goal}`,
                    "red",
                  );
                  count_1 += 1;
                } else {
                  exact = true;
                }
              }
            }
            if (!exact && count_1 !== 0) {
              if (killerInfo === locationName) {
                if (corrupted) {
                  auto_log_info(
                    "Doubly corrupted possible truth teller. This person is probably correct.",
                    "blue",
                  );
                  return false;
                }
                auto_log_info(
                  "Corrupted truth teller? Going to retry....",
                  "red",
                );
                corrupted = true;
                continue;
              }
              isTruth = false;
            }
          }
          //if still isTruth, we can try the relative questions if so desired.
          //Really, we should check the list of accused and try to uniquify it.

          otherPerson += 1;
          corrupted = false;
        }
      }
      if ((subEgg.get(4) ?? "") === "liar") {
        isTruth = false;
      }
      if (isTruth) {
        auto_log_info(
          `${subEgg.get(2) ?? ""} is accusing: ${subEgg.get(4) ?? ""} and may be telling the truth!`,
          "blue",
        );
        //Find person they are accusing and do it.

        for (const index_1 of eggData.keys()) {
          const subsubEgg: Map<number, string> = new Map(
            splitString(eggData.get(index_1) ?? "", ":").map((_v, _i) => [
              _i,
              _v,
            ]),
          );
          if (
            (subsubEgg.get(2) ?? "") === (subEgg.get(4) ?? "") ||
            (subsubEgg.get(3) ?? "") === (subEgg.get(4) ?? "")
          ) {
            auto_log_info(
              `Accusation against: ${subsubEgg.get(2) ?? ""}`,
              "blue",
            );
            page = visitUrl(`wham.php?visit=${subsubEgg.get(0) ?? ""}`, false);

            eggMatcher = new AshMatcher(
              "You have been on this case for (\\d+) minute(?:s?)",
              page,
            );
            if (eggMatcher.find()) {
              auto_log_info(
                `On the case for ${eggMatcher.group(1)} minutes...`,
                "green",
              );
            }

            page = visitUrl(
              `wham.php?visit=${subsubEgg.get(0) ?? ""}&accuse=${subsubEgg.get(0) ?? ""}`,
              false,
            );
            const pensionMatcher: AshMatcher = new AshMatcher(
              "been awarded (\\d+) cop dollars",
              page,
            );
            if (pensionMatcher.find()) {
              auto_log_info(
                `Received a pension of ${pensionMatcher.group(1)} cop dollars.`,
                "green",
              );
            }
            set("auto_eggDetective", "");
            return true;
          }
        }
      }
    }

    set("auto_eggDetective", `${get("auto_eggDetective")}solved`);
    return false;
  }

  return true;
}
