/**
 * Browsers cache favicons aggressively; a stable query helps after icon swaps.
 * Re-applies href on boot so the tab icon matches even if HTML was cached.
 */
export function ensureDiligentFavicon(): void {
  const base = import.meta.env.BASE_URL;
  const root = base.endsWith("/") ? base : `${base}/`;
  const href = `${root}favicon.ico?v=diligent`;

  const upsert = (rel: "icon" | "shortcut icon") => {
    let el = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
    if (!el) {
      el = document.createElement("link");
      el.rel = rel;
      document.head.appendChild(el);
    }
    el.type = "image/x-icon";
    el.href = href;
  };

  upsert("icon");
  upsert("shortcut icon");
}
