import type { AttributeType, Option } from "../../types/attribute.js";

/** Snapshot written on delete so “recently deleted” rows need no live attribute record. */
export type AuditDeleteSnapshot = {
  attributeType: AttributeType;
  sectionId: string;
};

/**
 * State of the attribute creation/edit form.
 * Tracks the two-step progressive disclosure flow:
 *   1. Type selection
 *   2. Attribute configuration (name, description, type-specific config)
 */
export interface AttributeFormState {
  /** Step 1 — null until the user picks a type */
  selectedType: AttributeType | null;

  /** Step 2 — common fields */
  name: string;
  description: string;

  /** singleSelect and multiSelect */
  options: Option[];

  /** currency */
  currencyCode: string;
  currencyMode: "perAttribute" | "perValue";

  /** attachment */
  attachmentMode: "single" | "multiple";

  /** user and users */
  allowGroups: boolean;

  /** ID of the OOTB section this attribute belongs to. Defaults to "overview". */
  sectionId: string;
}

export const INITIAL_FORM_STATE: AttributeFormState = {
  selectedType: null,
  name: "",
  description: "",
  options: [],
  currencyCode: "USD",
  currencyMode: "perAttribute",
  attachmentMode: "multiple",
  allowGroups: false,
  sectionId: "overview",
};

/** Controls the visibility and purpose of the side sheet. */
export type FormSheetMode = "create" | "edit" | null;

/** Toast notification state */
export interface ToastState {
  open: boolean;
  message: string;
  severity: "success" | "error" | "info" | "warning";
  /** When set, the toast renders a "View history" link for this attribute. */
  attributeId?: string;
}

/** A single field-level change captured during an edit operation. */
export interface ChangeRecord {
  field: string;
  from: string | null;
  to: string | null;
}

export type AuditAction = "created" | "edited" | "deprecated" | "deleted" | "reactivated";

/** A single entry in the schema change audit log. */
export interface AuditLogEntry {
  id: string;
  attributeId: string;
  attributeName: string;
  action: AuditAction;
  /** In production this would be the authenticated user. Prototype uses a fixed label. */
  actor: string;
  timestamp: string;
  /** Field-level changes captured for edit operations. */
  changes?: ChangeRecord[];
  /** Present on delete entries — drives “recently deleted” rows without a persisted attribute. */
  deleteSnapshot?: AuditDeleteSnapshot;
}
