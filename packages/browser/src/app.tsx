import React, { useState } from "react";
import {
  HashRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import {
  fetchRunInfo,
  refreshSession,
  refreshTrackingSections,
} from "./api/apiRequest";
import { collectSettings } from "./api/settingSearch";
import Layout from "./components/layout";
import { PageActiveContext } from "./components/topBarButton";
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

// Every page stays mounted so its collapsed groups and filters survive tab switches.
function Pages({
  paths,
  children,
}: {
  paths: string[];
  children: React.JSX.Element[];
}) {
  const location = useLocation();

  return (
    <>
      {children.map((page, index) => {
        const active = `/${paths[index]}` === location.pathname;

        return (
          <PageActiveContext.Provider key={page.key} value={active}>
            <div style={active ? undefined : { display: "none" }}>{page}</div>
          </PageActiveContext.Provider>
        );
      })}
    </>
  );
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

  const allPages = (
    <Pages paths={pages.map((p) => p.urlPath ?? "")}>
      {pages.map((p) => (
        <RelayPage
          key={`${p.urlPath} ${p.page}`}
          components={p.components.filter((c) => c.type !== "interrupt")}
          trackingSections={trackingSections}
          allSettings={allSettings}
          runInfo={runInfo}
          onRefreshAll={refreshAll}
        />
      ))}
    </Pages>
  );

  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout pages={pages} interrupts={interrupts} />}>
          {pages.map((p) => (
            <Route
              key={`${p.urlPath} ${p.page}`}
              path={`/${p.urlPath}`}
              element={allPages}
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
