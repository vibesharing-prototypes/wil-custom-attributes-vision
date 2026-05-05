/**
 * Workflow Management domain types.
 *
 * Shaped to match the Workflows Service API (xstate-inspired FSM engine).
 * References: Confluence — Workflows Service Core Concepts & Usage.
 *
 * These are prototype types; production would derive from API response schemas.
 */

// ─── Guard & Action ───────────────────────────────────────────────────────────

/** Synchronous webhook-based validation called before a state transition completes. */
export interface Guard {
  name: string;
  /** Currently only "custom_webhook" is supported by the service. */
  type: "custom_webhook";
  url: string;
}

/** Asynchronous EDA action triggered after a state transition is accepted. */
export interface Action {
  name: string;
  /** Currently only "custom" is supported by the service. */
  type: "custom";
}

// ─── Event schema ─────────────────────────────────────────────────────────────

/** JSON Schema payload validation for a State Transition Event. */
export interface EventSchema {
  type: "json_schema";
  schema: Record<string, unknown>;
}

// ─── Workflow Template Definition ─────────────────────────────────────────────

/**
 * A single outgoing transition event on a state.
 * Key in the parent `on` map is the event name (e.g. "submit_for_review").
 */
export interface TransitionEvent {
  /** Target state name. */
  target: string;
  guards?: Guard[];
  actions?: Action[];
  event_schema?: EventSchema;
}

/** A single state in the FSM. */
export interface WorkflowState {
  /** Map of event name → transition. Absent means terminal state. */
  on?: Record<string, TransitionEvent>;
}

/**
 * The formal FSM definition stored inside a Workflow Template.
 * Matches the `definition` field of the API resource.
 */
export interface WorkflowTemplateDefinition {
  /** Name of the initial state; new instances start here. */
  initial: string;
  states: Record<string, WorkflowState>;
}

// ─── Workflow Template ────────────────────────────────────────────────────────

/**
 * A Workflow Template — the versioned, named blueprint for a state machine.
 * Unique per (name + version + service + org_id).
 */
export interface WorkflowTemplate {
  id: string;
  name: string;
  version: number;
  /** Name of the consumer service that owns this template (e.g. "risk-manager"). */
  service: string;
  org_id: number;
  created_at: string;
  /** True when this is the latest version of the template. */
  latest: boolean;
  definition: WorkflowTemplateDefinition;
}

// ─── Workflow Instance ────────────────────────────────────────────────────────

/**
 * A Workflow Instance — tied to a single concrete object (e.g. a specific Risk record).
 * Holds the object's current state and lock status.
 */
export interface WorkflowInstance {
  id: string;
  workflow_templates_id: string;
  /** Current state name of the instance. */
  state: string;
  /**
   * UUID of the in-flight State Transition Event locking this instance,
   * or null when no event is being processed.
   */
  locked_by: string | null;
  org_id: number;
  created_at: string;
  updated_at: string;
  /**
   * Prototype-only field: reference to the host object this instance tracks.
   * In production this linkage lives on the host app side.
   */
  objectRef: {
    id: string;
    label: string;
    objectType: string;
  };
}

// ─── UI-layer helpers ─────────────────────────────────────────────────────────

/**
 * Derived view model for a single state, used by the board and detail panel.
 * Combines the API-shaped WorkflowState with display metadata.
 */
export interface StateViewModel {
  id: string;
  label: string;
  color: "default" | "info" | "warning" | "success";
  summary: string;
  description: string;
  /**
   * Ordered list of outgoing transitions, preserving the event name so it can be
   * displayed on the board card and in the detail drawer.
   */
  transitions: Array<{
    eventName: string;
    target: string;
    guards: Guard[];
    actions: Action[];
    hasEventSchema: boolean;
  }>;
}
