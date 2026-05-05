import type { WorkflowTemplate, WorkflowInstance, StateViewModel } from "./types.js";

// ─── Workflow Template ────────────────────────────────────────────────────────

/**
 * Risk lifecycle workflow template.
 * Shaped to match the Workflows Service API definition format.
 */
export const RISK_LIFECYCLE_TEMPLATE: WorkflowTemplate = {
  id: "wft-001",
  name: "Risk lifecycle",
  version: 1,
  service: "risk-manager",
  org_id: 100200,
  created_at: "2025-11-01T09:00:00Z",
  latest: true,
  definition: {
    initial: "draft",
    states: {
      draft: {
        on: {
          submit_for_assessment: {
            target: "in_progress",
            guards: [],
            actions: [],
          },
        },
      },
      in_progress: {
        on: {
          submit_for_review: {
            target: "in_review",
            guards: [
              {
                name: "check-required-fields-guard",
                type: "custom_webhook",
                url: "https://risk-manager.internal/guards/check-required-fields",
              },
            ],
            actions: [],
          },
        },
      },
      in_review: {
        on: {
          approve: {
            target: "done",
            guards: [
              {
                name: "check-reviewer-authorization-guard",
                type: "custom_webhook",
                url: "https://risk-manager.internal/guards/check-reviewer-auth",
              },
              {
                name: "check-required-fields-guard",
                type: "custom_webhook",
                url: "https://risk-manager.internal/guards/check-required-fields",
              },
            ],
            actions: [
              {
                name: "send-approval-notification-action",
                type: "custom",
              },
            ],
            event_schema: {
              type: "json_schema",
              schema: {
                type: "object",
                properties: {
                  reviewer: {
                    type: "object",
                    properties: {
                      userId: { type: "string" },
                      roleId: { type: "string" },
                    },
                    required: ["userId", "roleId"],
                  },
                  comments: { type: "string" },
                },
                required: ["reviewer"],
                additionalProperties: false,
              },
            },
          },
        },
      },
      done: {
        // Terminal state — no outgoing transitions.
      },
    },
  },
};

// ─── State view models ────────────────────────────────────────────────────────

/**
 * Derived display data for each state in the Risk lifecycle template.
 * Colour, label, and prose are not part of the service API — they live here as
 * UI metadata alongside the API-shaped definition.
 */
export const RISK_LIFECYCLE_STATE_VIEW_MODELS: StateViewModel[] = [
  {
    id: "draft",
    label: "Draft",
    color: "default",
    summary: "Risk identified and logged, pending assessment.",
    description:
      "Initial state. The risk has been identified and logged in the system. It has not yet been scored, assigned, or reviewed. Any user with create_risk permission can open a risk in Draft.",
    transitions: [
      {
        eventName: "submit_for_assessment",
        target: "in_progress",
        guards: [],
        actions: [],
        hasEventSchema: false,
      },
    ],
  },
  {
    id: "in_progress",
    label: "In progress",
    color: "info",
    summary: "Risk is being actively assessed and scored.",
    description:
      "The risk is being actively assessed: impact, likelihood, and mitigation options are being evaluated. The Risk Owner is responsible for completing the assessment and populating required fields for this stage.",
    transitions: [
      {
        eventName: "submit_for_review",
        target: "in_review",
        guards: [
          {
            name: "check-required-fields-guard",
            type: "custom_webhook",
            url: "https://risk-manager.internal/guards/check-required-fields",
          },
        ],
        actions: [],
        hasEventSchema: false,
      },
    ],
  },
  {
    id: "in_review",
    label: "In review",
    color: "warning",
    summary: "Assessment submitted; reviewer validating score and plan.",
    description:
      "Assessment submitted for formal review. A designated reviewer validates the risk score, mitigation plan, and supporting documentation before the risk can be closed. Records entering this state are read-only for the Risk Owner.",
    transitions: [
      {
        eventName: "approve",
        target: "done",
        guards: [
          {
            name: "check-reviewer-authorization-guard",
            type: "custom_webhook",
            url: "https://risk-manager.internal/guards/check-reviewer-auth",
          },
          {
            name: "check-required-fields-guard",
            type: "custom_webhook",
            url: "https://risk-manager.internal/guards/check-required-fields",
          },
        ],
        actions: [
          {
            name: "send-approval-notification-action",
            type: "custom",
          },
        ],
        hasEventSchema: true,
      },
    ],
  },
  {
    id: "done",
    label: "Done",
    color: "success",
    summary: "Assessment accepted; risk monitored on an ongoing basis.",
    description:
      "Risk assessment is complete and formally accepted. The risk enters ongoing monitoring. Records in Done are read-only for standard users. Reopening requires escalation to the Head of Audit.",
    transitions: [],
  },
];

// ─── Workflow Instances ───────────────────────────────────────────────────────

/**
 * Simulated workflow instances for the Risk lifecycle template.
 * One instance is locked (async action in progress); the rest are in normal states.
 */
export const RISK_LIFECYCLE_INSTANCES: WorkflowInstance[] = [
  {
    id: "wfi-001",
    workflow_templates_id: "wft-001",
    state: "draft",
    locked_by: null,
    org_id: 100200,
    created_at: "2026-03-10T08:15:00Z",
    updated_at: "2026-03-10T08:15:00Z",
    objectRef: {
      id: "risk-201",
      label: "Cyber resilience gaps — EMEA region",
      objectType: "risk",
    },
  },
  {
    id: "wfi-002",
    workflow_templates_id: "wft-001",
    state: "in_progress",
    locked_by: null,
    org_id: 100200,
    created_at: "2026-02-20T14:30:00Z",
    updated_at: "2026-03-18T10:22:00Z",
    objectRef: {
      id: "risk-202",
      label: "Regulatory non-compliance — data residency",
      objectType: "risk",
    },
  },
  {
    id: "wfi-003",
    workflow_templates_id: "wft-001",
    state: "in_progress",
    locked_by: null,
    org_id: 100200,
    created_at: "2026-03-01T09:00:00Z",
    updated_at: "2026-03-25T16:45:00Z",
    objectRef: {
      id: "risk-203",
      label: "Third-party concentration — Acme Corp",
      objectType: "risk",
    },
  },
  {
    id: "wfi-004",
    workflow_templates_id: "wft-001",
    state: "in_review",
    /**
     * This instance is locked: an async "send-approval-notification-action" is
     * in progress following the "approve" transition event. The instance will
     * unlock when the consumer app sends back the completion event.
     */
    locked_by: "ste-a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    org_id: 100200,
    created_at: "2026-01-15T11:00:00Z",
    updated_at: "2026-04-14T09:03:00Z",
    objectRef: {
      id: "risk-204",
      label: "IT access control weakness — legacy systems",
      objectType: "risk",
    },
  },
  {
    id: "wfi-005",
    workflow_templates_id: "wft-001",
    state: "done",
    locked_by: null,
    org_id: 100200,
    created_at: "2025-11-10T08:00:00Z",
    updated_at: "2026-02-28T17:10:00Z",
    objectRef: {
      id: "risk-205",
      label: "Vendor lock-in — cloud infrastructure",
      objectType: "risk",
    },
  },
];
