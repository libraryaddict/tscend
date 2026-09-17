import React, { useState } from "react";
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";

import {
  fetchRunInfo,
  refreshSession,
  refreshTrackingSections,
} from "./api/apiRequest";
import { collectSettings } from "./api/settingSearch";
import Layout from "./components/layout";
import RelayPage from "./routes/relayPage";
import {
  ComponentRunInfo,
  ComponentTracking,
  RelayComponent,
  RelayInterrupt,
  RelayPage as RelayPageData,
  RunInfoData,
  TrackingSection,
} from "./types/types";

const emptyRunInfo: RunInfoData = { tiles: [], locations: [] };

function findComponent<T extends RelayComponent>(
  pages: RelayPageData[],
  type: T["type"],
): T | undefined {
  for (const page of pages) {
    const found = page.components.find((c) => c.type === type);

    if (found) {
      return found as T;
    }
  }

  return undefined;
}

function App({ pages }: { pages: RelayPageData[] }) {
  const [trackingSections, setTrackingSections] = useState<TrackingSection[]>(
    () => findComponent<ComponentTracking>(pages, "tracking")?.sections ?? [],
  );
  const [runInfo, setRunInfo] = useState<RunInfoData>(
    () =>
      findComponent<ComponentRunInfo>(pages, "runinfo")?.data ?? emptyRunInfo,
  );

  const allSettings = pages.flatMap((p) => collectSettings(p.components));

  const interrupts = pages.flatMap(
    (p) =>
      p.components.filter((c) => c.type === "interrupt") as RelayInterrupt[],
  );

  async function refreshAll(): Promise<void> {
    const [sections, info] = await Promise.all([
      refreshTrackingSections(trackingSections),
      fetchRunInfo(),
      refreshSession(),
    ]);

    setTrackingSections(sections);
    setRunInfo(info);
  }

  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout pages={pages} interrupts={interrupts} />}>
          {pages.map((p) => (
            <Route
              key={`${p.urlPath} ${p.page}`}
              path={`/${p.urlPath}`}
              element={
                <RelayPage
                  components={p.components.filter(
                    (c) => c.type !== "interrupt",
                  )}
                  trackingSections={trackingSections}
                  allSettings={allSettings}
                  runInfo={runInfo}
                  onRefreshAll={refreshAll}
                />
              }
            />
          ))}
          <Route
            path="*"
            element={<Navigate to={`/${pages[0].urlPath}`} replace={true} />}
          />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
