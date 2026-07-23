import * as React from "react";
import { useState } from "react";

import { addNotification, saveSettings } from "../api/apiRequest";
import { collectSettings, settingMatches } from "../api/settingSearch";
import { createValidator } from "../api/settingValidator";
import Group from "../components/group";
import Interrupt from "../components/interrupt";
import SettingsTable from "../components/settings/settingsTable";
import Tracking from "../components/tracking";
import {
  ComponentSetting,
  ComponentTracking,
  RelayComponent,
  RelayGroup,
  RelayHtml,
  RelayInterrupt,
} from "../types/types";

function RelayPage({
  components,
}: {
  components: RelayComponent[];
}): React.JSX.Element {
  const [search, setSearch] = useState("");
  const query = search.trim();

  const allSettings = collectSettings(components);
  const matchCount = allSettings.filter((s) => settingMatches(s, query)).length;

  const validator = createValidator();

  for (const setting of allSettings) {
    validator.object[setting.preference] = setting.value;
  }

  const batches: (RelayComponent | ComponentSetting[])[] = [];
  let currentBatch: ComponentSetting[] | undefined;

  for (const component of components) {
    if ((component as ComponentSetting).preference) {
      if (!currentBatch) {
        currentBatch = [];
        batches.push(currentBatch);
      }

      currentBatch.push(component as ComponentSetting);
      continue;
    }

    batches.push(component);
    currentBatch = undefined;
  }

  const elements: (React.JSX.Element | null)[] = batches.map((batch, index) => {
    if (Array.isArray(batch)) {
      const visible = batch.filter((s) => settingMatches(s, query));

      return (
        <SettingsTable
          key={`Table ${index}`}
          settings={visible}
          validator={validator}
        />
      );
    }

    switch (batch.type) {
      case "group":
        return (
          <Group
            key={`Group ${(batch as RelayGroup).name} ${index}`}
            group={batch as RelayGroup}
            search={query}
            validator={validator}
          />
        );
      case "html": {
        const html = batch as RelayHtml;

        if (!html.data) {
          return null;
        }

        return (
          <div
            key={`HTML ${index}`}
            dangerouslySetInnerHTML={{ __html: html.data }}
          />
        );
      }
      case "interrupt":
        return (
          <Interrupt
            key={`Interrupt ${index}`}
            button={batch as RelayInterrupt}
          />
        );
      case "tracking":
        return (
          <Tracking
            key={`Tracking ${index}`}
            sections={(batch as ComponentTracking).sections}
          />
        );
      default:
        return null;
    }
  });

  validator.updateObject();

  if (allSettings.length === 0) {
    return <>{elements}</>;
  }

  let leadingCount = 0;

  while (
    leadingCount < batches.length &&
    !Array.isArray(batches[leadingCount]) &&
    (batches[leadingCount] as RelayComponent).type === "interrupt"
  ) {
    leadingCount++;
  }

  return (
    <>
      <div className="topRow">
        <div className="topRowSide">
          <div className="settingsSearchBar">
            <input
              className="searchInput"
              type="text"
              placeholder="Search settings..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {query ? (
              <span className="searchCount">
                {matchCount} setting{matchCount === 1 ? "" : "s"} found
              </span>
            ) : null}
          </div>
        </div>
        <div className="topRowCenter">{elements.slice(0, leadingCount)}</div>
        <div className="topRowSide" aria-hidden="true" />
      </div>
      {elements.slice(leadingCount)}
      <input
        className="save"
        onClick={() =>
          saveSettings(allSettings).then((notifs) => {
            for (const notif of notifs) {
              addNotification(notif);
            }
          })
        }
        type="submit"
        value="Save Changes"
      />
    </>
  );
}

export default RelayPage;
