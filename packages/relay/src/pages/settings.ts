import {
  entityEncode,
  Familiar,
  myAscensions,
  myFamiliar,
  turnsPlayed,
} from "kolmafia";
import { get } from "libram";

import { settingDefaults } from "../../../kolmafia/src/autoscend/auto_settings";
import { safeGet } from "../../../kolmafia/src/autoscend/auto_util";
import {
  RelayComponent,
  RelayGroup,
  RelayInterrupt,
  RelayPage,
  RelaySetting,
} from "../../../shared/src/relayTypes";
import { html } from "../relayUtils";

interface SettingEntry {
  name: string;
  property: string;
  type: string;
  description: string;
  default?: string;
  tags: string;
}

interface GroupDef {
  name: string;
  description?: string;
  color?: string;
  children?: Record<string, GroupDef>;
}

function buildGroup(
  path: string,
  def: GroupDef,
  settingsData: Record<string, SettingEntry[]>,
  collapsed: boolean,
  inheritedColor?: string,
): RelayGroup | undefined {
  const color = def.color ?? inheritedColor;
  const components: RelayComponent[] = [];

  if (def.children) {
    for (const [childPath, childDef] of Object.entries(def.children)) {
      const child = buildGroup(childPath, childDef, settingsData, true, color);

      if (child) components.push(child);
    }
  }

  const settings = settingsData[path.toLowerCase()];

  if (settings?.length) {
    for (const setting of settings) {
      components.push({
        type: setting.type === "boolean" ? "boolean" : "string",
        name: setting.name,
        preference: setting.property,
        description: setting.description,
        default: setting.default ?? settingDefaults.get(setting.property),
        tags: setting.tags.split(",").filter(Boolean),
      } as RelaySetting);
    }
  }

  if (components.length === 0) return undefined;

  return {
    type: "group",
    name: def.name,
    description: def.description,
    color,
    collapsed,
    components,
  };
}

const settingGroupDefs =
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("data:setting_groups") as Record<string, GroupDef>;

const settingsData =
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("data:autoscend_settings") as Record<string, SettingEntry[]>;

function settingGroups(): RelayGroup[] {
  const groups: RelayGroup[] = [];

  for (const [path, def] of Object.entries(settingGroupDefs)) {
    const group = buildGroup(path, def, settingsData, groups.length > 0); // first group starts expanded

    if (group) groups.push(group);
  }

  return groups;
}

function familiarComponents(): RelayComponent[] {
  const components: RelayComponent[] = [];
  const hundredFam: Familiar = safeGet("auto_100familiar", Familiar.none);
  const changeable = turnsPlayed() === 0;

  if (hundredFam !== Familiar.none) {
    components.push(
      html(
        `100% familiar is set to <b>${entityEncode(`${hundredFam}`)}</b>.${
          changeable
            ? " Turns played is at 0 so it might be possible to change this, so long as you have not done any free fights."
            : ""
        }`,
      ),
    );

    if (changeable) {
      components.push({
        type: "interrupt",
        name: "Disable 100% familiar run",
        color: "primary",
        notification: "100% familiar run disabled",
        actions: [{ preference: "auto_100familiar", value: "none" }],
      } as RelayInterrupt);
    }
  } else if (changeable) {
    components.push(
      html(
        "100% familiar has not been set. Turns played is at 0 so it might be possible to change this, so long as you have not done any free fights.",
      ),
    );
    components.push({
      type: "interrupt",
      name: `Set ${myFamiliar()} as 100% target`,
      color: "primary",
      notification: `100% familiar set to ${myFamiliar()}`,
      actions: [{ preference: "auto_100familiar", value: `${myFamiliar()}` }],
    } as RelayInterrupt);
  }
  // If it's not set and it's too late to change it, we're not in a 100% run and there's nothing to say

  return components;
}

export function settingsPage(): RelayPage {
  const components: RelayComponent[] = [
    {
      type: "interrupt",
      name: "Safely Stop Autoscend",
      notification: "Autoscend will stop after the current action is finished.",
      actions: [{ preference: "auto_interrupt", value: "true" }],
    } as RelayInterrupt,
    ...familiarComponents(),
    html(
      myAscensions() === get("auto_doneInitialize", 0)
        ? "Settings have been initialized for current ascension. You may change Post type settings."
        : "Settings have <b>not</b> been initialized for current ascension. Do not change Post type settings.",
    ),
    ...settingGroups(),
  ];

  return {
    page: "Settings",
    urlPath: "settings",
    title: "autoscend manager",
    components: components,
  };
}
