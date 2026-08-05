import { abort, print, userConfirm } from "kolmafia";
import { get, set, sinceKolmafiaRevision } from "libram";

import {
  print_help_text,
  sad_times,
  safe_preference_reset_wrapper,
} from "./autoscend";
import { printSim } from "./autoscend/auto_sim";
import {
  auto_log_info,
  AutoStopError,
  backupSetting,
  meatReserveMessage,
} from "./autoscend/auto_util";
import { autoscend_migrate } from "./autoscend/autoscend_migration";
import { Args } from "./autoscend/utils/grimoireArgs";

const args = Args.create(
  "autoscend",
  "This is the help section, this is a helpful description. Much wow. You can, and should, manage the settings through the relay page.",
  {
    sim: Args.flag({
      key: "sim",
      help: "display useful items/skills/perms/etc and if the user has them",
      setting: "",
    }),
    turbo: Args.flag({
      key: "turbo",
      help: "This will get expensive for you. This should only be used if you are trying to go for a 1-day and don't care about expenses.",
      setting: "auto_turbo",
    }),
    tasks: Args.flag({
      key: "tasks",
      help: "Print off the tasks, used for debugging",
      setting: "",
    }),
  },
);

export function main(input: string = ""): void {
  // Rationale for using package.json revision is that if we bumped the kolmafia version, then we clearly are building against newer features.
  // @ts-expect-error TS2304 - 'require' is used for esbuild
  sinceKolmafiaRevision(require("data:kolmafia_revision") as number); // eslint-disable-line @typescript-eslint/no-require-imports

  Args.fill(args, input);

  if (args.help) {
    Args.showHelp(args);
    return;
  }

  if (args.sim) {
    // display useful items/skills/perms/etc and if the user has them
    printSim();
    return;
  }

  if (args.turbo) {
    if (!get("auto_turbo", false)) {
      // gotta go faaaaaast. Doing a double confirm because of the nature of this parameter.
      if (
        userConfirm(
          "This will get expensive for you. This should only be used if you are trying to go for a 1-day and don't care about expenses. Do you really want to do this? Will default to 'No' in 15 seconds.",
          15000,
          false,
        )
      ) {
        if (
          userConfirm(
            "This will use UMSBs and Spice Melanges if you have them. If you are ok with this, you have 15 seconds to hit 'Yes'",
            15000,
            false,
          )
        ) {
          backupSetting("auto_turbo", "true");
        } else {
          auto_log_info("Alright, stopping autoscend here.");
          return;
        }
      } else {
        auto_log_info("Alright, stopping autoscend here.");
        return;
      }
    }

    auto_log_info("Ka-chow! Gotta go fast.");
  }

  backupSetting("printStackOnAbort", true.toString());
  print_help_text();
  sad_times();
  if (
    !autoscend_migrate() &&
    !userConfirm(
      "autoscend might not have upgraded from a previous version correctly, do you want to continue? Will default to true in 10 seconds.",
      10000,
      true,
    )
  ) {
    abort("User aborted script after failed migration.");
  }
  try {
    safe_preference_reset_wrapper(3);
  } catch (e) {
    if (!(e instanceof AutoStopError)) {
      throw e;
    }
    if (e.message) {
      print(e.message, "red");
    }
  } finally {
    if (get("auto_stop", false)) {
      set("auto_stop", false);
      meatReserveMessage();
      auto_log_info(
        "auto_stop detected and quietly exiting, auto_stop disabled.",
      );
    }
  }
}
