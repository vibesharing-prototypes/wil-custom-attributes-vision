import type { Guard, Action } from "./types.js";

/**
 * Draft model for the Workflow Template editor.
 *
 * Uses an ordered array of states (not a Record) so that:
 * - Display order is explicit and stable.
 * - State names are editable without breaking internal references.
 *
 * Each state has a stable `draftId` used for cross-references.
 * On export, `draftId` is discarded and `name` becomes the FSM state key.
 */

// ─── Status indicator color ───────────────────────────────────────────────────

/**
 * Semantic color for a workflow state node, aligned with the Atlas StatusIndicator
 * palette. This is purely a UI/display concern — the Workflows Service API has no
 * color field; colors are authored here and stored in the editor draft only.
 */
export type StatusIndicatorColor =
  | "subtle"
  | "information"
  | "warning"
  | "success"
  | "error"
  | "generic";

/** Ordered list for the color picker. */
export const STATUS_INDICATOR_COLORS: StatusIndicatorColor[] = [
  "subtle",
  "information",
  "warning",
  "success",
  "error",
  "generic",
];

/**
 * Subtle background fill per color — mirrors the Atlas semantic tokens used
 * in StatusIndicator and on the workflow overview board.
 */
export const STATUS_INDICATOR_BG: Record<StatusIndicatorColor, string> = {
  subtle: "var(--lens-semantic-color-surface-subtle, #f5f5f5)",
  information: "var(--lens-semantic-color-status-info-subtle, #e8f4fd)",
  warning: "var(--lens-semantic-color-status-warning-subtle, #fff8e1)",
  success: "var(--lens-semantic-color-status-success-subtle, #e8f5e9)",
  error: "var(--lens-semantic-color-status-error-subtle, #feecec)",
  generic: "var(--lens-semantic-color-status-generic-subtle, #f3e8fd)",
};

/** Accent / ring color used for selection rings and swatch borders. */
export const STATUS_INDICATOR_RING: Record<StatusIndicatorColor, string> = {
  subtle: "#9e9e9e",
  information: "#1565c0",
  warning: "#e65100",
  success: "#2e7d32",
  error: "#c62828",
  generic: "#6a1b9a",
};

export interface TransitionDraft {
  draftId: string;
  /** The trigger name — shown on the connection element on the canvas. */
  eventName: string;
  /** References WorkflowStateDraft.draftId of the target state. */
  targetDraftId: string;
  guards: Guard[];
  actions: Action[];
}

export interface WorkflowStateDraft {
  /** Stable internal ID — never shown to users. */
  draftId: string;
  /** Editable state name — becomes the FSM state key on export (e.g. "in_progress"). */
  name: string;
  /** Human-readable description shown in the canvas card and side sheet. */
  description: string;
  /**
   * UI-only semantic color for this state node.
   * Not persisted to the Workflows Service API — used only in the prototype
   * overview board and canvas to give each state a visual identity.
   */
  color: StatusIndicatorColor;
  /**
   * UI-only graph canvas position (React Flow x/y coordinates).
   * Undefined on first render — the canvas assigns a default from the state's
   * array index. Persisted here so rearranged positions survive sheet round-trips.
   * Not exported to the Workflows Service API.
   */
  position?: { x: number; y: number };
  /** Outgoing transitions. Linear flow: 0 = terminal, 1 = normal. */
  transitions: TransitionDraft[];
}

export interface WorkflowDraft {
  name: string;
  version: number;
  service: string;
  /** Ordered array; index 0 is the initial state. */
  states: WorkflowStateDraft[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Generate a short, unique draft ID. Not cryptographically strong — prototype only. */
export function newDraftId(prefix = "d"): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Build the single empty placeholder state shown on a brand-new canvas. */
export function createPlaceholderState(): WorkflowStateDraft {
  return {
    draftId: newDraftId("state"),
    name: "",
    description: "",
    color: "subtle",
    transitions: [],
  };
}

/** Build a new empty state with a connecting transition from the given source state. */
export function createNextStatePair(sourceStateId: string): {
  newState: WorkflowStateDraft;
  newTransition: TransitionDraft;
} {
  const newState: WorkflowStateDraft = {
    draftId: newDraftId("state"),
    name: "",
    description: "",
    color: "subtle",
    transitions: [],
  };
  const newTransition: TransitionDraft = {
    draftId: newDraftId("trans"),
    eventName: "",
    targetDraftId: newState.draftId,
    guards: [],
    actions: [],
  };
  return { newState, newTransition: { ...newTransition, draftId: newDraftId("trans") } };
}
