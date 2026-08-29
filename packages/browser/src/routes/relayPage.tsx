import * as React from "react";
import { useState } from "react";

import { addNotification, saveSettings } from "../api/apiRequest";
import { collectSettings, settingMatches } from "../api/settingSearch";
import { createValidator } from "../api/settingValidator";
import Group from "../components/group";
import RunInfo from "../components/runInfo";
import SettingsTable from "../components/settings/settingsTable";
import TopBarButton from "../components/topBarButton";
import Tracking from "../components/tracking";
import {
  ComponentSetting,
  RelayComponent,
  RelayGroup,
  RelayHtml,
  RunInfoData,
  TrackingSection,
} from "../types/types";

function RelayPage({
  components,
  trackingSections,
  runInfo,
  onRefreshAll,
}: {
  components: RelayComponent[];
  trackingSections: TrackingSection[];
  runInfo: RunInfoData;
  onRefreshAll: () => void;
}): React.JSX.Element {
  const [search, setSearch] = useState("");
  const [lastSaved, setLastSaved] = useState(0);
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
          lastSaved={lastSaved}
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
            lastSaved={lastSaved}
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
      case "tracking":
        return (
          <Tracking
            key={`Tracking ${index}`}
            sections={trackingSections}
            onRefresh={onRefreshAll}
          />
        );
      case "runinfo":
        return (
          <RunInfo
            key={`RunInfo ${index}`}
            data={runInfo}
            onRefresh={onRefreshAll}
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

  return (
    <>
      <TopBarButton
        label="Save"
        onClick={() =>
          saveSettings(allSettings).then((notifs) => {
            for (const notif of notifs) {
              addNotification(notif);
            }
            setLastSaved((v) => v + 1);
          })
        }
      />
      <div className="topRow">
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
      {elements}
    </>
  );
}

export default RelayPage;
