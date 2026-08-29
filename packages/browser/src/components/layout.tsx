import React from "react";
import { NavLink, Outlet } from "react-router-dom";

import { RelayInterrupt, RelayPage } from "../types/types";
import Interrupt from "./interrupt";

const Layout = ({
  pages,
  interrupts,
}: {
  pages: RelayPage[];
  interrupts: RelayInterrupt[];
}) => {
  return (
    <>
      <nav className="topBar">
        <div className="topBarTabs">
          {pages.length > 1
            ? pages.map((p) => (
                <div key={`${p.urlPath} ${p.page}`} className="tabEntry">
                  <NavLink to={`/${p.urlPath}`}>{p.page}</NavLink>
                </div>
              ))
            : null}
        </div>
        <div className="interruptBar">
          {interrupts.map((interrupt, index) => (
            <Interrupt key={`${interrupt.name} ${index}`} button={interrupt} />
          ))}
        </div>
        <div id="topBarActions" className="topBarActions"></div>
      </nav>
      <div id="notificationsContainer"></div>
      <div id="relayContainer">
        <Outlet />
      </div>
    </>
  );
};

export default Layout;
