import {
  cliExecute,
  getProperty,
  propertyExists,
  removeProperty,
  replaceString,
  setProperty,
  svnExists,
  svnInfo,
  toBoolean,
  userConfirm,
} from "kolmafia";

import {
  auto_log_error,
  auto_log_info,
  auto_log_info$1,
  auto_log_warning,
  auto_log_warning$1,
} from "./auto_util";
import { fileAsMap } from "./utils/kolmafiaUtils";

let $_f___autoscend_version: string | undefined;
$_f___autoscend_version ??= "1.8.0";
let $_f___autoscend_confirm_timeoutMS: number | undefined;
$_f___autoscend_confirm_timeoutMS ??= 10000;
let $_f___remove_sl_ascend_confirmation: string | undefined;
$_f___remove_sl_ascend_confirmation ??=
  "Looks like you have the old sl_ascend project installed as well. Would you like to remove it? (it is no longer maintained). Will default to false in 10 seconds.";
let $_f___migrate_sl_ascend_properties_confirmation: string | undefined;
$_f___migrate_sl_ascend_properties_confirmation ??=
  "Looks like you may be migrating from sl_ascend. Starting with a fresh run using autoscend is adviable but we can try to migrate all the sl_ascend properties (results may vary). Will default to true in 10 seconds.";
let $_f___migrate_sl_ascend_properties_remove_confirmation: string | undefined;
$_f___migrate_sl_ascend_properties_remove_confirmation ??=
  "Would you like to clean up old sl_ascend properties after migrating them? Will default to false in 10 seconds.";

//Defined in autoscend/autoscend_migration.ash
function autoscend_current_version(): string {
  if (!propertyExists("auto_current_version")) {
    setProperty("auto_current_version", $_f___autoscend_version);
  }
  return getProperty("auto_current_version");
}

function autoscend_previous_version(): string {
  if (!propertyExists("auto_prev_version")) {
    setProperty("auto_prev_version", "0.0.0");
  }
  return getProperty("auto_prev_version");
}

function autoscend_needs_update(): boolean {
  if (
    autoscend_previous_version() === "0.0.0" ||
    autoscend_current_version() !== $_f___autoscend_version
  ) {
    if (toBoolean(getProperty("auto_need_update"))) {
      auto_log_info$1(
        "Forcing migration (partially complete migration or user set flag): auto_need_update => true",
      );
    }
    setProperty("auto_need_update", true.toString());
  }
  return toBoolean(getProperty("auto_need_update"));
}

let $_autoscend_migrate_props: Map<number, string> | undefined;

export function autoscend_migrate(): boolean {
  $_autoscend_migrate_props = fileAsMap("autoscend_properties.txt", [
    Number,
    String,
  ]);

  function repo_present(repo: string): boolean {
    return svnExists(repo) || svnInfo(repo).url !== "";
  }

  function repo_name(repo: string): string {
    if (svnExists(repo)) {
      return repo;
    }
    // the svn ash functions dont seem very reliable in my experience
    // construct mafia's repo naming from the repo url
    let name: string = replaceString(
      svnInfo(repo).url,
      "https://github.com/",
      "",
    );
    name = replaceString(name, "http://github.com/", "");
    name = replaceString(name, "/", "-");
    return name;
  }

  function sanity_check_sl_ascend_autoscend_properties(): boolean {
    let prop_conflicts: number = 0;
    for (const [_, p] of $_autoscend_migrate_props) {
      const old_prop: string = replaceString(p, "auto_", "sl_");
      if (propertyExists(old_prop)) {
        if (
          propertyExists(p) &&
          propertyExists(old_prop) &&
          getProperty(p) !== getProperty(old_prop)
        ) {
          auto_log_warning$1(
            `Conflict: ${old_prop} (${getProperty(old_prop)}) !== ${p} (${getProperty(p)})`,
          );
          prop_conflicts++;
        }
      }
    }

    if (prop_conflicts > 0) {
      auto_log_error(
        `Found ${prop_conflicts} conflicting property values while migrating from sl_ascend properties to autoscend properties. Old property value will be ignored. Please do not use sl_ascend and autoscend at the same time.`,
      );
      return false;
    }
    return true;
  }
  /*
   * Migrate sl_* properties to auto_* properties. Attempts to look for and warn about conflicts.
   *
   * Returns true if the property migration ran successfully with no conflicts,
   * false if the user declined the migration or the migration ran and saw conflicting
   * property values.
   */
  function autoscend_migrate_properties(): boolean {
    if (
      !userConfirm(
        $_f___migrate_sl_ascend_properties_confirmation,
        $_f___autoscend_confirm_timeoutMS,
        true,
      )
    ) {
      return false;
    }

    const cleanup: boolean = userConfirm(
      $_f___migrate_sl_ascend_properties_remove_confirmation,
      $_f___autoscend_confirm_timeoutMS,
      false,
    );

    let prop_conflicts: number = 0;
    for (const [_, p] of $_autoscend_migrate_props) {
      const old_prop: string = replaceString(p, "auto_", "sl_");
      if (propertyExists(old_prop)) {
        if (!propertyExists(p)) {
          auto_log_info$1(
            `Migrating ${old_prop} => ${p} (${getProperty(old_prop)})`,
          );
          setProperty(p, getProperty(old_prop));
        } else if (getProperty(old_prop) !== getProperty(p)) {
          auto_log_warning(
            `Conflict: ${old_prop} (${getProperty(old_prop)}) !== ${p} (${getProperty(p)})`,
            "red",
          );
          prop_conflicts++;
        }
        if (cleanup) {
          removeProperty(old_prop);
        }
      }
    }

    if (prop_conflicts > 0) {
      auto_log_error(
        `Found ${prop_conflicts} conflicting property values while migrating from sl_ascend properties to autoscend properties. Old property value will be ignored. Please do not use sl_ascend and autoscend at the same time.`,
      );
      return false;
    }
    return true;
  }
  /*
   * Look for and remove sl_ascend repo if it exists, prompting the user for confirmation.
   *
   * Returns true if sl_ascend repo is abscent after the function runs or false if it is
   * present.
   */
  function remove_sl_ascend_repos(): boolean {
    if (repo_present("sl_ascend")) {
      if (
        userConfirm(
          $_f___remove_sl_ascend_confirmation,
          $_f___autoscend_confirm_timeoutMS,
          false,
        )
      ) {
        cliExecute(`svn delete ${repo_name("sl_ascend")}`);
      }
    }
    return !repo_present("sl_ascend");
  }

  function finalize_update(): void {
    setProperty("auto_need_update", false.toString());
    setProperty("auto_prev_version", getProperty("auto_current_version"));
    setProperty("auto_current_version", $_f___autoscend_version);
  }

  let all_good: boolean = true;
  if (autoscend_needs_update()) {
    auto_log_info(
      `Migrating from ${autoscend_previous_version()} to ${$_f___autoscend_version}`,
      "blue",
    );
    if (autoscend_previous_version() === "0.0.0" && repo_present("sl_ascend")) {
      all_good = autoscend_migrate_properties() && remove_sl_ascend_repos();
    }
    finalize_update();
  } else if (repo_present("sl_ascend")) {
    all_good = sanity_check_sl_ascend_autoscend_properties();
  }
  return all_good;
}
