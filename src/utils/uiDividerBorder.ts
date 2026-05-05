/**
 * Color/UI/Divider/Default — `semantic.color.ui.divider.default`.
 * Prefer this for card, panel, and list outlines so borders stay subtle across themes.
 */
export function uiDividerDefaultBorderColor(tokens: {
  semantic: {
    color: {
      ui?: {
        divider?: {
          default?: {
            value?: string;
          };
        };
      };
    };
  };
}): string {
  return tokens.semantic.color.ui?.divider?.default?.value ?? "divider";
}
