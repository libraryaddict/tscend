import * as React from "react";
import { createPortal } from "react-dom";

import { usePortalTarget } from "../hooks/usePortalTarget";

function TopBarButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}): React.JSX.Element {
  const bar = usePortalTarget("topBarActions");

  const button = (
    <input
      className="topBarButton"
      type="button"
      value={label}
      onClick={onClick}
    />
  );

  return bar ? createPortal(button, bar) : button;
}

export default TopBarButton;
