/**
 * Builds a space-separated aria-describedby string from an array of IDs.
 * Filters out undefined values and returns undefined when no IDs remain,
 * which prevents setting an empty aria-describedby attribute.
 */
export const ariaDescribedBy = (ids: Array<string | undefined>): string | undefined =>
  ids.filter(Boolean).join(" ") || undefined;
