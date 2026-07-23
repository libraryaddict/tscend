import { ComponentSetting, RelayComponent, RelayGroup } from "../types/types";

export function collectSettings(
  components: RelayComponent[],
): ComponentSetting[] {
  const settings: ComponentSetting[] = [];

  for (const component of components) {
    if (component.type === "group") {
      settings.push(...collectSettings((component as RelayGroup).components));
    } else if ((component as ComponentSetting).preference) {
      settings.push(component as ComponentSetting);
    }
  }

  return settings;
}

export function settingMatches(
  setting: ComponentSetting,
  search: string,
): boolean {
  if (!search) {
    return true;
  }

  const query = search.toLowerCase();

  return (
    setting.preference.toLowerCase().includes(query) ||
    (setting.name ?? "").toLowerCase().includes(query) ||
    (setting.description ?? "").toLowerCase().includes(query) ||
    (setting.tags ?? []).some((t) => t.toLowerCase().includes(query))
  );
}
