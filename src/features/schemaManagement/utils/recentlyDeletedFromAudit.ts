import type { AttributeDefinition } from "../../../types/attribute.js";
import type { AuditLogEntry } from "../types.js";

/**
 * Latest delete (or legacy deprecated) audit entry per attribute id that is not in the active custom list.
 */
function latestDeletedEntries(auditLog: AuditLogEntry[], activeCustomIds: Set<string>): Map<string, AuditLogEntry> {
  const latest = new Map<string, AuditLogEntry>();
  for (let i = auditLog.length - 1; i >= 0; i--) {
    const e = auditLog[i];
    if (e.action !== "deleted" && e.action !== "deprecated") continue;
    if (activeCustomIds.has(e.attributeId)) continue;
    if (!latest.has(e.attributeId)) latest.set(e.attributeId, e);
  }
  return latest;
}

/** Groups deleted audit rows by schema section (uses deleteSnapshot.sectionId when present). */
export function collectRecentlyDeletedBySection(
  auditLog: AuditLogEntry[],
  customAttributes: AttributeDefinition[],
  sectionIds: string[],
): Record<string, AuditLogEntry[]> {
  const activeIds = new Set(customAttributes.map((a) => a.id));
  const latest = latestDeletedEntries(auditLog, activeIds);
  const fallback = sectionIds[0] ?? "overview";
  const bySection: Record<string, AuditLogEntry[]> = {};
  for (const sid of sectionIds) {
    bySection[sid] = [];
  }
  for (const e of latest.values()) {
    const rawSid = e.deleteSnapshot?.sectionId ?? fallback;
    const sid = bySection[rawSid] != null ? rawSid : fallback;
    bySection[sid].push(e);
  }
  for (const sid of sectionIds) {
    bySection[sid].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }
  return bySection;
}

/** Flat list for single-section surfaces (e.g. BOS custom list). */
export function collectRecentlyDeletedFlat(
  auditLog: AuditLogEntry[],
  customAttributes: AttributeDefinition[],
): AuditLogEntry[] {
  const activeIds = new Set(customAttributes.map((a) => a.id));
  const latest = latestDeletedEntries(auditLog, activeIds);
  return [...latest.values()].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}
