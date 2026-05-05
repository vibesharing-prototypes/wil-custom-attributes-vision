import type {
  PermissionCustomSnapshot,
  PermissionItem,
  PermissionLevel,
  PermissionSection,
} from "./types.js";

export function snapshotColumns(section: PermissionSection): PermissionCustomSnapshot {
  return {
    leftColumn: section.leftColumn.map((p) => ({ ...p })),
    rightColumn: section.rightColumn.map((p) => ({ ...p })),
  };
}

/** Deep-clone columns from a snapshot onto the section (ids/labels/levels). */
export function applyColumnSnapshot(section: PermissionSection, snapshot: PermissionCustomSnapshot): PermissionSection {
  return {
    ...section,
    leftColumn: snapshot.leftColumn.map((p) => ({ ...p })),
    rightColumn: snapshot.rightColumn.map((p) => ({ ...p })),
  };
}

export function getSectionItems(section: PermissionSection): PermissionItem[] {
  return [...section.leftColumn, ...section.rightColumn];
}

export function getSectionAttributeCount(section: PermissionSection): number {
  return section.leftColumn.length + section.rightColumn.length;
}

/** When every attribute shares the same level, return it; otherwise null. Empty → null. */
export function getUniformLevel(section: PermissionSection): PermissionLevel | null {
  const items = getSectionItems(section);
  if (items.length === 0) return null;
  const first = items[0].level;
  return items.every((i) => i.level === first) ? first : null;
}

export function applyLevelToAll(section: PermissionSection, level: PermissionLevel): PermissionSection {
  return {
    ...section,
    leftColumn: section.leftColumn.map((p) => ({ ...p, level })),
    rightColumn: section.rightColumn.map((p) => ({ ...p, level })),
  };
}

export function countLevels(section: PermissionSection): { none: number; view: number; edit: number } {
  const items = getSectionItems(section);
  return items.reduce(
    (acc, p) => {
      if (p.level === "none") acc.none += 1;
      else if (p.level === "view") acc.view += 1;
      else acc.edit += 1;
      return acc;
    },
    { none: 0, view: 0, edit: 0 },
  );
}
