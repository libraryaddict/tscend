import React from "react";

import { ComponentSetting } from "../types/types";

export interface Validator {
  object: Record<string, string>;
  addSetting: (
    setting: ComponentSetting,
    setValid: React.Dispatch<boolean>,
  ) => void;
  updateSetting: (setting: ComponentSetting) => void;
  updateObject: () => void;
  isValid: (setting: ComponentSetting) => boolean;
}

export function createValidator(): Validator {
  const settings: [ComponentSetting, React.Dispatch<boolean>][] = [];
  const object: Record<string, string> = {};

  function isValid(setting: ComponentSetting): boolean {
    return !setting.validate || setting.validate(setting.value, object);
  }

  function doValidates() {
    for (const [setting, setValid] of settings) {
      setValid(isValid(setting));
    }
  }

  return {
    object,
    addSetting(setting, setValid) {
      settings.push([setting, setValid]);
    },
    updateSetting(setting) {
      object[setting.preference] = setting.value;
      doValidates();
    },
    updateObject() {
      for (const [setting] of settings) {
        object[setting.preference] = setting.value;
      }
    },
    isValid,
  };
}
