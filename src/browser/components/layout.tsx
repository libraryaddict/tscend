import React from "react";
import { NavLink, Outlet } from "react-router-dom";

import { RelayPage } from "../types/types";

const Layout = ({ pages }: { pages: RelayPage[] }) => {
  return (
    <>
      <nav>
        <div className="topBar">
          {pages.length > 1
            ? pages.map((p) => (
                <div key={`${p.urlPath} ${p.page}`} className="tabEntry">
                  <NavLink to={`/${p.urlPath}`}>{p.page}</NavLink>
                </div>
              ))
            : null}
        </div>
      </nav>
      <div id="notificationsContainer"></div>
      <div id="relayContainer">
        <Outlet />
      </div>
    </>
  );
};

export default Layout;
