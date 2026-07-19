import React, { useState } from "react";

import { collectSettings, settingMatches } from "../api/settingSearch";
import { Validator } from "../api/settingValidator";
import { ComponentSetting, RelayGroup } from "../types/types";
import CollapsibleHeader from "./collapsible";
import SettingsTable from "./settings/settingsTable";

function Group({
  group,
  search,
  validator,
}: {
  group: RelayGroup;
  search: string;
  validator: Validator;
}): React.JSX.Element | null {
  const [open, setOpen] = useState(false);

  const settings = group.components.filter(
    (c) => (c as ComponentSetting).preference,
  ) as ComponentSetting[];
  const subgroups = group.components.filter(
    (c) => c.type === "group",
  ) as RelayGroup[];
  const visible = settings.filter((s) => settingMatches(s, search));

  const allSettings = collectSettings(group.components);
  const visibleCount = allSettings.filter((s) =>
    settingMatches(s, search),
  ).length;

  if (search && visibleCount === 0) {
    return null;
  }

  const expanded = search !== "" || open;

  return (
    <>
      <section
        className="settingsGroup"
        style={group.color ? { borderLeftColor: group.color } : undefined}
      >
        <CollapsibleHeader
          expanded={expanded}
          onToggle={() => setOpen(!open)}
          className="groupHeader"
        >
          <span className="groupTitle">{group.name}</span>
          <span className="groupCount">
            {search
              ? `${visibleCount} / ${allSettings.length}`
              : allSettings.length}
          </span>
        </CollapsibleHeader>
      </section>
      {expanded ? (
        <div
          className="groupBody"
          style={group.color ? { borderLeftColor: group.color } : undefined}
        >
          <div className="groupBodyInner">
            {group.description ? (
              <p className="groupDescription">{group.description}</p>
            ) : null}
            {subgroups.length > 0 ? (
              <div className="settingsSubgroups">
                {subgroups.map((subgroup) => (
                  <Group
                    key={subgroup.name}
                    group={subgroup}
                    search={search}
                    validator={validator}
                  />
                ))}
              </div>
            ) : null}
            <SettingsTable settings={visible} validator={validator} />
          </div>
        </div>
      ) : null}
    </>
  );
}

export default Group;
