import React from "react";
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";

import Layout from "./components/layout";
import RelayPage from "./routes/relayPage";
import { RelayPage as RelayPageData } from "./types/types";

function App({ pages }: { pages: RelayPageData[] }) {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout pages={pages} />}>
          {pages.map((p) => (
            <Route
              key={`${p.urlPath} ${p.page}`}
              path={`/${p.urlPath}`}
              element={<RelayPage components={p.components} />}
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
