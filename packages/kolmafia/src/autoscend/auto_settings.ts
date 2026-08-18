import {
  getProperty,
  propertyExists,
  propertyHasDefault,
  removeProperty,
} from "kolmafia";
import { get, set } from "libram";

import { auto_log_info } from "./auto_util";

const settingExtras =
  // @ts-expect-error TS2591
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("data:setting_extras") as Record<
    string,
    { default?: string; resets?: "day" | "ascend" }
  >;

//# These functions are used to either upgrade format on properties. delete obsolete properties. or set default values for new properties

export function auto_settingsFix(): void {
  //fix settings where user inputted an invalid value
  if (get("auto_save_adv_override", 0) < -1) {
    set("auto_save_adv_override", -1); //values lower than -1 are not valid
  }
  if (get("auto_log_level", 0) < 0) {
    set("auto_log_level", 0); //values lower than 0 are not valid
  }
  if (get("auto_log_level", 0) > 3) {
    set("auto_log_level", 3); //values higher than 3 are not valid
  }
  if (get("auto_log_level_restore", 0) < 0) {
    set("auto_log_level_restore", 0); //values lower than 0 are not valid
  }
  if (get("auto_log_level_restore", 0) > 2) {
    set("auto_log_level_restore", 2); //values higher than 2 are not valid
  }
}

function defaultConfig(prop: string, val: string): void {
  //this function is used to configure default values. it only makes a change if the current value is nothing
  if (propertyExists(prop)) {
    if (val !== "") {
      return;
    }

    // We don't set an empty string, remove it if we did
    if (!propertyHasDefault(prop) && val === "" && getProperty(prop) === "") {
      auto_log_info(`Removed empty string default for ${prop}`);
      removeProperty(prop);
    }
    return;
  } else if (val === "") {
    return;
  }

  auto_log_info(
    `${prop} has no value set. setting it to the default value of ${val}`,
  );
  set(prop, val);
}

export const settingDefaults: ReadonlyMap<string, string> = new Map([
  ...Object.entries(settingExtras).flatMap(([property, extra]) =>
    extra.default !== undefined ? [[property, extra.default] as const] : [],
  ),
]);

function auto_settingsDefaults(): void {
  //set default values for settings which have not yet been configured
  for (const [prop, val] of settingDefaults) {
    defaultConfig(prop, val);
  }
}

// Define if a setting is reset in the .yml files
export function auto_settingsApplyResets(...kind: ("day" | "ascend")[]): void {
  for (const [prop, extra] of Object.entries(settingExtras)) {
    if (extra.resets === undefined || !kind.includes(extra.resets)) continue;

    const val = settingDefaults.get(prop);
    if (val === undefined) {
      removeProperty(prop);
    } else {
      set(prop, val);
    }
  }
}

export function auto_settings(): void {
  auto_settingsFix(); //fix settings where user inputted an invalid value
  auto_settingsDefaults(); //set default values for settings which have not yet been configured
}
