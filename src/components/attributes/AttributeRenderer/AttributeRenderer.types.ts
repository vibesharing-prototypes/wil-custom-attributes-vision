import type { AttributeDefinition } from "../../../types/attribute.js";

/**
 * Visual/interactive state of an attribute field.
 * M0 prototype uses "readOnly" exclusively.
 * M1 will use all states: default, filled, required, error, disabled.
 */
export type AttributeState =
  | "default"   // empty, interactive — field ready for input
  | "filled"    // has a value, interactive
  | "required"  // required + currently empty, interactive
  | "error"     // failed validation — shows errorMessage
  | "readOnly"  // display-only, no interaction
  | "disabled"; // non-interactive, visually muted

export interface AttributeRendererProps {
  definition: AttributeDefinition;
  /** The current value of the attribute. Shape depends on attribute type. */
  value?: unknown;
  /** Defaults to "readOnly" for the M0 schema viewer. */
  state?: AttributeState;
  /** Only rendered when state === "error". */
  errorMessage?: string;
}
