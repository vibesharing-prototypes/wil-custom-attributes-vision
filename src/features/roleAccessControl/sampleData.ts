import type {
  PermissionItem,
  RoleApplicationSection,
  RoleEditModel,
  RoleListEntry,
  RoleRuleDraft,
} from "./types.js";

function deepClone<T>(v: T): T {
  try {
    return structuredClone(v);
  } catch {
    return JSON.parse(JSON.stringify(v)) as T;
  }
}

function remapRuleIds(rule: RoleRuleDraft, newRuleId: string): RoleRuleDraft {
  return {
    ...rule,
    id: newRuleId,
    isDraftRule: true,
    conditions: rule.conditions.map((c, i) => ({ ...c, id: `${newRuleId}-cond-${i}` })),
    sections: rule.sections.map((s, si) => {
      const sectionId = `${newRuleId}-sec-${si}`;
      const leftColumn = s.leftColumn.map((item, ii) => ({ ...item, id: `${sectionId}-l-${ii}` }));
      const rightColumn = s.rightColumn.map((item, ii) => ({ ...item, id: `${sectionId}-r-${ii}` }));
      let lastCustomSnapshot = s.lastCustomSnapshot;
      if (lastCustomSnapshot) {
        lastCustomSnapshot = {
          leftColumn: lastCustomSnapshot.leftColumn.map((item, ii) => ({
            ...item,
            id: `${sectionId}-snap-l-${ii}`,
          })),
          rightColumn: lastCustomSnapshot.rightColumn.map((item, ii) => ({
            ...item,
            id: `${sectionId}-snap-r-${ii}`,
          })),
        };
      }
      return {
        ...s,
        id: sectionId,
        leftColumn,
        rightColumn,
        lastCustomSnapshot,
      };
    }),
  };
}

/** Default template: all None (group None / new sections). */
const STANDARD_LEFT: PermissionItem[] = [
  { id: "ov", label: "Overview", level: "none" },
  { id: "dt", label: "Details", level: "none" },
  { id: "as", label: "Assessment", level: "none" },
  { id: "mt", label: "Mitigation", level: "none" },
  { id: "ow", label: "Ownership", level: "none" },
  { id: "ds", label: "Design", level: "none" },
  { id: "ts", label: "Testing", level: "none" },
];

const STANDARD_RIGHT: PermissionItem[] = [
  { id: "ev", label: "Evidence", level: "none" },
  { id: "st", label: "Steps", level: "none" },
  { id: "sl", label: "SLA", level: "none" },
  { id: "dp", label: "Dependencies", level: "none" },
  { id: "mx", label: "Metrics", level: "none" },
  { id: "tl", label: "Timeline", level: "none" },
  { id: "rv", label: "Review", level: "none" },
];

/** Mixed levels for a sample “Custom” section. */
const MIXED_LEFT: PermissionItem[] = [
  { id: "ov", label: "Overview", level: "edit" },
  { id: "dt", label: "Details", level: "edit" },
  { id: "as", label: "Assessment", level: "view" },
  { id: "mt", label: "Mitigation", level: "view" },
  { id: "ow", label: "Ownership", level: "edit" },
  { id: "ds", label: "Design", level: "edit" },
  { id: "ts", label: "Testing", level: "view" },
];

const MIXED_RIGHT: PermissionItem[] = [
  { id: "ev", label: "Evidence", level: "edit" },
  { id: "st", label: "Steps", level: "edit" },
  { id: "sl", label: "SLA", level: "edit" },
  { id: "dp", label: "Dependencies", level: "view" },
  { id: "mx", label: "Metrics", level: "view" },
  { id: "tl", label: "Timeline", level: "none" },
  { id: "rv", label: "Review", level: "none" },
];

/** Shared factory for the role editor (sample data and “Add rule”). */
export function createRoleRuleDraft(id: string): RoleRuleDraft {
  return {
    id,
    objectType: "risk",
    conditions: [
      {
        id: `${id}-c1`,
        fieldType: "status",
        operator: "is",
        value: "in_progress",
      },
      {
        id: `${id}-c2`,
        fieldType: "attribute",
        fieldName: "impact",
        operator: "is",
        value: "moderate",
      },
    ],
    actionListView: false,
    actionNextStatus: false,
    sections: [
      {
        id: `${id}-s1`,
        title: "Risk record",
        summaryLevel: "none",
        lastGroupLevel: "none",
        useCustom: false,
        expanded: false,
        lastCustomSnapshot: null,
        leftColumn: STANDARD_LEFT.map((p) => ({ ...p, id: `${id}-s1-${p.id}` })),
        rightColumn: STANDARD_RIGHT.map((p) => ({ ...p, id: `${id}-s1-${p.id}` })),
      },
      {
        id: `${id}-s2`,
        title: "Linked items",
        summaryLevel: "view",
        lastGroupLevel: "view",
        useCustom: true,
        expanded: false,
        lastCustomSnapshot: null,
        leftColumn: MIXED_LEFT.map((p) => ({ ...p, id: `${id}-s2-${p.id}` })),
        rightColumn: MIXED_RIGHT.map((p) => ({ ...p, id: `${id}-s2-${p.id}` })),
      },
      {
        id: `${id}-s3`,
        title: "Workflow & status",
        summaryLevel: "edit",
        lastGroupLevel: "edit",
        useCustom: false,
        expanded: false,
        lastCustomSnapshot: null,
        leftColumn: STANDARD_LEFT.map((p) => ({ ...p, id: `${id}-s3-${p.id}`, level: "edit" })),
        rightColumn: STANDARD_RIGHT.map((p) => ({ ...p, id: `${id}-s3-${p.id}`, level: "edit" })),
      },
    ],
  };
}

export const SAMPLE_CUSTOM_RISK_OWNER: RoleEditModel = {
  id: "custom-risk-owner",
  name: "Custom Risk Owner",
  kind: "custom",
  basedOnOotbRoleName: "Risk Approver",
  applicationName: "Risk Manager",
  requiredLicense: "Diligent One Platform (User)",
  description:
    "Tailored permissions for risk owners who need scoped edit access without full admin capabilities. Use this role when workflow requires owners to update mitigation plans but not approve enterprise-wide policy.",
  headerNote:
    'This is a preconfigured settings for the First Line Control Owner role. Out-of-the-box roles cannot be edited directly. To modify these permissions, use the "Clone and edit" action to create a new version.',
  rules: [createRoleRuleDraft("rule-1")],
};

export const rolesHomeSections: RoleApplicationSection[] = [
  {
    id: "risk-manager",
    applicationName: "Risk Manager",
    description:
      "Manage access via the Asset Roles tab in Risk Manager, or clone a default role to customize conditions and permissions.",
    roles: [
      { id: "risk-viewer", name: "Risk Viewer", kind: "ootb", derivedRoleCount: 2 },
      { id: "risk-editor", name: "Risk Editor", kind: "ootb", derivedRoleCount: 1 },
      { id: "risk-assessor", name: "Risk Assessor", kind: "ootb" },
      { id: "risk-approver", name: "Risk Approver", kind: "ootb", derivedRoleCount: 3 },
      { id: "risk-admin", name: "Risk Admin", kind: "ootb" },
      {
        id: "custom-risk-owner",
        name: "Custom Risk Owner",
        kind: "custom",
        basedOnRoleName: "Risk Approver",
      },
    ],
  },
  {
    id: "risk-essentials",
    applicationName: "Risk Essentials",
    description: "Lighter-weight roles for contributors who only need read or limited write access.",
    roles: [
      { id: "re-viewer", name: "Risk viewer", kind: "ootb" },
      { id: "re-contributor", name: "Risk contributor", kind: "ootb" },
      { id: "re-assessor", name: "Risk assessor", kind: "ootb" },
      { id: "re-reviewer", name: "Risk reviewer", kind: "ootb" },
      { id: "re-admin", name: "Risk admin", kind: "ootb" },
    ],
  },
];

function findRoleInCatalog(
  roleId: string,
): { entry: RoleListEntry; section: RoleApplicationSection } | undefined {
  for (const section of rolesHomeSections) {
    const entry = section.roles.find((r) => r.id === roleId);
    if (entry) return { entry, section };
  }
  return undefined;
}

/** OOTB role id in the same application — used for “Based on” links on the role edit page. */
export function findOotbRoleIdInApplication(
  applicationName: string,
  ootbRoleName: string,
): string | undefined {
  const section = rolesHomeSections.find((s) => s.applicationName === applicationName);
  if (!section) return undefined;
  const role = section.roles.find((r) => r.kind === "ootb" && r.name === ootbRoleName);
  return role?.id;
}

/**
 * Name of the root OOTB role for entitlement lineage: duplicating a custom copy still points at
 * the original OOTB role, not the intermediate copy.
 */
export function resolveOotbLineageRootName(source: RoleEditModel): string {
  if (source.kind === "ootb") {
    return source.name;
  }
  if (source.basedOnOotbRoleName?.trim()) {
    return source.basedOnOotbRoleName.trim();
  }
  const catalogHit = findRoleInCatalog(source.id);
  if (catalogHit?.entry.basedOnRoleName?.trim()) {
    return catalogHit.entry.basedOnRoleName.trim();
  }
  return source.name;
}

/**
 * Deep-clone a role for “duplicate”: new model id, custom kind, fresh rule/section/condition ids.
 * Caller should set `name` (e.g. append localized " (copy)").
 * `basedOnOotbRoleName` is always the root OOTB role, not the immediate parent copy.
 */
export function duplicateRoleEditModel(source: RoleEditModel): RoleEditModel {
  const stamp = Date.now();
  const next = deepClone(source);
  next.id = `role-dup-${stamp}`;
  next.kind = "custom";
  next.basedOnOotbRoleName = resolveOotbLineageRootName(source);
  next.rules = source.rules.map((r, i) => remapRuleIds(deepClone(r), `rule-${stamp}-${i}`));
  return next;
}

/** Prototype template for any catalog role that does not have a hand-authored editor model. */
function buildSyntheticRoleEditModel(
  entry: RoleListEntry,
  section: RoleApplicationSection,
): RoleEditModel {
  return {
    id: entry.id,
    name: entry.name,
    kind: entry.kind,
    applicationName: section.applicationName,
    requiredLicense: "Diligent One Platform (User)",
    description: `Sample permissions for ${entry.name} in ${section.applicationName}.`,
    headerNote:
      "Out-of-the-box roles cannot be edited directly in the host app. In this prototype, duplicating creates a new custom role you can adjust.",
    rules: [createRoleRuleDraft(`rule-${entry.id}`)],
    basedOnOotbRoleName:
      entry.kind === "custom" && entry.basedOnRoleName != null && entry.basedOnRoleName.trim() !== ""
        ? entry.basedOnRoleName.trim()
        : undefined,
  };
}

const EDIT_MODELS: Record<string, RoleEditModel> = {
  [SAMPLE_CUSTOM_RISK_OWNER.id]: SAMPLE_CUSTOM_RISK_OWNER,
};

/** Resolve a role for the editor: curated models first, otherwise a synthetic template from the home catalog. */
export function getRoleEditModelForEditor(roleId: string): RoleEditModel | undefined {
  const curated = EDIT_MODELS[roleId];
  if (curated) return deepClone(curated);
  const found = findRoleInCatalog(roleId);
  if (!found) return undefined;
  return buildSyntheticRoleEditModel(found.entry, found.section);
}

export function getRoleEditModel(roleId: string): RoleEditModel | undefined {
  return EDIT_MODELS[roleId];
}

export function getDefaultRoleEditModel(): RoleEditModel {
  return SAMPLE_CUSTOM_RISK_OWNER;
}
