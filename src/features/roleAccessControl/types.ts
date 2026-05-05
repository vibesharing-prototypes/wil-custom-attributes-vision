/**
 * Prototype domain model for roles & permissions UI.
 * PAC V3 uses catalog-backed conditions; this UI uses a flexible row shape
 * so the prototype can diverge from schema management without coupling to it.
 */
export type PermissionLevel = "none" | "view" | "edit";

/** Bulk mode for a permission section card (accordion summary). */
export type SectionPermissionMode = PermissionLevel | "custom";

export interface PermissionItem {
  id: string;
  label: string;
  level: PermissionLevel;
}

/** Per-attribute state captured when leaving Custom; restored the next time Custom is enabled. */
export interface PermissionCustomSnapshot {
  leftColumn: PermissionItem[];
  rightColumn: PermissionItem[];
}

export interface PermissionSection {
  id: string;
  title: string;
  /** Bulk mode when not in Custom (None | View | Edit). */
  summaryLevel: PermissionLevel;
  /** Last group mode chosen; used when turning Custom off while attributes are mixed. */
  lastGroupLevel: PermissionLevel;
  useCustom: boolean;
  expanded: boolean;
  leftColumn: PermissionItem[];
  rightColumn: PermissionItem[];
  /** Set when Custom turns off; reapplied when Custom turns on (if present). */
  lastCustomSnapshot: PermissionCustomSnapshot | null;
}

export interface ConditionClause {
  id: string;
  fieldType: string;
  fieldName?: string;
  operator: string;
  value: string;
}

export interface RoleRuleDraft {
  id: string;
  /** Newly added rule; cancel removes it instead of restoring a snapshot. */
  isDraftRule?: boolean;
  objectType: string;
  conditions: ConditionClause[];
  actionListView: boolean;
  actionNextStatus: boolean;
  sections: PermissionSection[];
}

export type RoleKind = "ootb" | "custom";

export interface RoleListEntry {
  id: string;
  name: string;
  kind: RoleKind;
  basedOnRoleName?: string;
  derivedRoleCount?: number;
}

export interface RoleApplicationSection {
  id: string;
  applicationName: string;
  description: string;
  roles: RoleListEntry[];
}

export interface RoleEditModel {
  id: string;
  name: string;
  kind: RoleKind;
  applicationName: string;
  requiredLicense: string;
  description: string;
  headerNote: string;
  rules: RoleRuleDraft[];
  /**
   * For custom roles: the **root OOTB role** this chain was derived from (never another custom copy).
   * Used for the “based on: …” chip and entitlement ceilings in the product model.
   */
  basedOnOotbRoleName?: string;
}
