/**
 * Atlas / Lens theme tokens sometimes expose leaves as `{ value: T }`. Browsers also default
 * `<h2>` to `font-weight: bold` (700) when `font-weight` is missing or invalid — so emphasis must
 * resolve to a real number (spec: `semantic.fontWeight.emphasis` → `core.fontWeight.semiBold` → 600).
 */

/** Drops `undefined` entries so MUI `SxProps` accepts token-derived typography objects. */
export function compactAtlasSx<T extends Record<string, unknown>>(style: T): Record<string, unknown> {
  return Object.fromEntries(Object.entries(style).filter(([, v]) => v !== undefined));
}

export function unwrapAtlasDesignToken(value: unknown): unknown {
  if (value == null) return value;
  if (typeof value === "string" || typeof value === "number") return value;
  if (typeof value === "object" && "value" in (value as object)) {
    return unwrapAtlasDesignToken((value as { value: unknown }).value);
  }
  return value;
}

function cssLeaf(value: unknown): string | number | undefined {
  const v = unwrapAtlasDesignToken(value);
  if (typeof v === "string" || typeof v === "number") return v;
  return undefined;
}

/** `semantic.fontWeight.emphasis` → semiBold (600); safe fallback matches Atlas spec if token missing. */
export function atlasFontWeightEmphasis(tokens: Record<string, unknown>): number {
  const semantic = tokens.semantic as { fontWeight?: { emphasis?: unknown } } | undefined;
  const v = unwrapAtlasDesignToken(semantic?.fontWeight?.emphasis);
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return 600;
}

/** Page-level H1: `semantic.font.title.h1Billboard` + emphasis. */
export function sxPageTitleH1BillboardEmphasis({ tokens }: { tokens: Record<string, unknown> }) {
  const semantic = tokens.semantic as {
    font: { title: { h1Billboard: Record<string, unknown> } };
    color?: { type?: { default?: { value?: string } } };
  };
  const h1 = semantic.font.title.h1Billboard;
  return {
    m: 0,
    color: semantic.color?.type?.default?.value ?? "text.primary",
    fontFamily: cssLeaf(h1.fontFamily),
    fontSize: cssLeaf(h1.fontSize),
    fontWeight: atlasFontWeightEmphasis(tokens),
    letterSpacing: cssLeaf(h1.letterSpacing),
    lineHeight: cssLeaf(h1.lineHeight),
    textTransform: cssLeaf(h1.textTransform),
  };
}

/** Section H2: `semantic.font.title.h2Display` + emphasis (e.g. “Role details”, “Rules”, app names on home). */
export function sxSectionTitleH2DisplayEmphasis({ tokens }: { tokens: Record<string, unknown> }) {
  const semantic = tokens.semantic as {
    font: { title: { h2Display: Record<string, unknown> } };
    color?: { type?: { default?: { value?: string } } };
  };
  const h2 = semantic.font.title.h2Display;
  return {
    m: 0,
    color: semantic.color?.type?.default?.value ?? "text.primary",
    fontFamily: cssLeaf(h2.fontFamily),
    fontSize: cssLeaf(h2.fontSize),
    fontWeight: atlasFontWeightEmphasis(tokens),
    letterSpacing: cssLeaf(h2.letterSpacing),
    lineHeight: cssLeaf(h2.lineHeight),
    textTransform: cssLeaf(h2.textTransform),
  };
}

/** Rule card H3: `semantic.font.title.h3Lg` + emphasis. */
export function sxRuleCardTitleH3Emphasis({ tokens }: { tokens: Record<string, unknown> }) {
  const semantic = tokens.semantic as {
    font: { title: { h3Lg: Record<string, unknown> } };
    color?: { type?: { default?: { value?: string } } };
  };
  const h3 = semantic.font.title.h3Lg;
  return {
    m: 0,
    minWidth: 0,
    color: semantic.color?.type?.default?.value ?? "text.primary",
    fontFamily: cssLeaf(h3.fontFamily),
    fontSize: cssLeaf(h3.fontSize),
    fontWeight: atlasFontWeightEmphasis(tokens),
    letterSpacing: cssLeaf(h3.letterSpacing),
    lineHeight: cssLeaf(h3.lineHeight),
    textTransform: cssLeaf(h3.textTransform),
  };
}
