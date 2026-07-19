import * as React from "react";

import { addNotification, setProperties } from "../api/apiRequest";
import { RelayInterrupt } from "../types/types";

function Interrupt({ button }: { button: RelayInterrupt }): React.JSX.Element {
  return (
    <input
      className={`interrupt${button.color === "primary" ? " interrupt-primary" : ""}`}
      type="submit"
      value={button.name}
      data-name={button.name}
      onClick={() => {
        setProperties(
          button.actions.map(({ preference, value }) => [preference, value]),
        ).then(() => addNotification(button.notification || "Interrupted!"));
      }}
    />
  );
}

export default Interrupt;
