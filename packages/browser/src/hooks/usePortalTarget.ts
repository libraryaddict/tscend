import { useLayoutEffect, useState } from "react";

export function usePortalTarget(id: string): HTMLElement | null {
  const [target, setTarget] = useState<HTMLElement | null>(null);

  useLayoutEffect(() => {
    setTarget(document.getElementById(id));
  }, [id]);

  return target;
}
