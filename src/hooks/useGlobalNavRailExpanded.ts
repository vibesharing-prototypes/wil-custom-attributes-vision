import type { RefObject } from "react";
import { useEffect, useState } from "react";

/** Icon-only rail is typically ~56–80px; labeled rail is ~200px+. */
const COLLAPSED_AT_OR_BELOW_PX = 96;
const EXPANDED_AT_OR_ABOVE_PX = 176;

/**
 * Tracks whether the nav slot is wide enough to show the deployment notice,
 * by observing the navigation root element the hook is wired to.
 */
export function useGlobalNavRailExpanded(navRootRef: RefObject<HTMLElement | null>): boolean {
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    const el = navRootRef.current;
    if (!el) return;

    const readWidth = () => Math.round(el.getBoundingClientRect().width);

    const apply = (width: number) => {
      if (width <= 0) return;
      setExpanded((prev) => {
        if (width <= COLLAPSED_AT_OR_BELOW_PX) return false;
        if (width >= EXPANDED_AT_OR_ABOVE_PX) return true;
        return prev;
      });
    };

    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      const w = entry
        ? Math.round(
            entry.borderBoxSize?.[0]?.inlineSize ??
              entry.contentRect.width,
          )
        : readWidth();
      apply(w > 0 ? w : readWidth());
    });
    ro.observe(el);

    let raf = 0;
    const scheduleInitial = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        raf = requestAnimationFrame(() => apply(readWidth()));
      });
    };
    scheduleInitial();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [navRootRef]);

  return expanded;
}
