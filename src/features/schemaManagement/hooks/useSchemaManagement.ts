import { useCallback, useState } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import type { AttributeDefinition } from "../../../types/attribute.js";
import type {
  AuditDeleteSnapshot,
  AuditLogEntry,
  AuditAction,
  ChangeRecord,
  ToastState,
} from "../types.js";
import { STR } from "../../../utils/i18n.js";

/** Hardcoded actor for the prototype — in production this is the authenticated user. */
const PROTOTYPE_ACTOR = "Schema Administrator";

const AUDITABLE_FIELDS: Array<keyof AttributeDefinition> = [
  "name",
  "semanticDescription",
];

const FIELD_DISPLAY_NAMES: Partial<Record<keyof AttributeDefinition, string>> = {
  name: "Name",
  semanticDescription: "Description",
};

function computeChanges(
  old: AttributeDefinition,
  updates: Partial<AttributeDefinition>,
): ChangeRecord[] {
  return AUDITABLE_FIELDS.reduce<ChangeRecord[]>((acc, field) => {
    const oldVal = old[field];
    const newVal = updates[field];
    if (newVal !== undefined && newVal !== oldVal) {
      acc.push({
        field: FIELD_DISPLAY_NAMES[field] ?? String(field),
        from: oldVal != null ? String(oldVal) : null,
        to: newVal != null ? String(newVal) : null,
      });
    }
    return acc;
  }, []);
}

function createEntry(
  attributeId: string,
  attributeName: string,
  action: AuditAction,
  changes?: ChangeRecord[],
  deleteSnapshot?: AuditDeleteSnapshot,
): AuditLogEntry {
  return {
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    attributeId,
    attributeName,
    action,
    actor: PROTOTYPE_ACTOR,
    timestamp: new Date().toISOString(),
    changes: changes && changes.length > 0 ? changes : undefined,
    ...(deleteSnapshot ? { deleteSnapshot } : {}),
  };
}

/**
 * Local state management for the schema management surface (M1).
 * In production, these operations would be backed by API calls.
 * Maintains both the custom attribute list and a full audit log of all schema changes.
 */
export function useSchemaManagement(
  initialAttributes: AttributeDefinition[] = [],
  initialAuditEntries: AuditLogEntry[] = [],
) {
  const [customAttributes, setCustomAttributes] = useState<AttributeDefinition[]>(initialAttributes);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>(initialAuditEntries);
  const [toast, setToast] = useState<ToastState>({ open: false, message: "", severity: "success" });

  const showToast = useCallback(
    (message: string, severity: ToastState["severity"] = "success", attributeId?: string) => {
      setToast({ open: true, message, severity, attributeId });
    },
    [],
  );

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, open: false }));
  }, []);

  /**
   * Adds a new attribute. The ID is generated here so the audit entry can reference it
   * immediately, without requiring callers to pre-generate IDs.
   */
  const addAttribute = useCallback(
    (def: Omit<AttributeDefinition, "id">) => {
      const id = `custom-${Date.now()}`;
      const fullDef = { ...def, id } as AttributeDefinition;
      setCustomAttributes((prev) => [...prev, fullDef]);
      setAuditLog((prev) => [...prev, createEntry(id, def.name, "created")]);
      showToast(STR.toasts.attributeAdded, "success", id);
    },
    [showToast],
  );

  /**
   * Updates an existing attribute. Pass `oldAttribute` to capture a field-level diff
   * in the audit log — callers have access to the pre-edit state.
   */
  const updateAttribute = useCallback(
    (id: string, updates: Partial<AttributeDefinition>, oldAttribute?: AttributeDefinition) => {
      const changes = oldAttribute ? computeChanges(oldAttribute, updates) : [];
      setCustomAttributes((prev) =>
        prev.map((attr) => (attr.id === id ? { ...attr, ...updates } : attr)),
      );
      const name = (updates.name ?? oldAttribute?.name) || id;
      setAuditLog((prev) => [...prev, createEntry(id, name, "edited", changes)]);
      showToast(STR.toasts.attributeUpdated, "success", id);
    },
    [showToast],
  );

  /**
   * Hard-delete: removes the attribute from the active list. “Recently deleted” is driven
   * solely by the audit entry (including deleteSnapshot for type + section placement).
   */
  const deleteAttribute = useCallback(
    (attribute: AttributeDefinition, reason?: string) => {
      const { id, name, type, sectionId } = attribute;
      const changes: ChangeRecord[] = reason
        ? [{ field: "Deletion reason", from: null, to: reason }]
        : [];
      const deleteSnapshot: AuditDeleteSnapshot = {
        attributeType: type,
        sectionId: sectionId ?? "overview",
      };
      setCustomAttributes((prev) => prev.filter((attr) => attr.id !== id));
      setAuditLog((prev) => [...prev, createEntry(id, name, "deleted", changes, deleteSnapshot)]);
      showToast(STR.toasts.attributeDeleted, "info", id);
    },
    [showToast],
  );

  /** Prototype-only: replace the full custom-attribute list (e.g. sectioned reorder + persist from the host). */
  const replaceCustomAttributes = useCallback((next: AttributeDefinition[]) => {
    setCustomAttributes(structuredClone(next));
  }, []);

  /** Prototype-only: flat list reorder (legacy schema list); prefer replaceCustomAttributes + session persist. */
  const reorderCustomAttributes = useCallback((activeId: string, overId: string) => {
    setCustomAttributes((prev) => {
      const oldIndex = prev.findIndex((a) => a.id === activeId);
      const newIndex = prev.findIndex((a) => a.id === overId);
      if (oldIndex < 0 || newIndex < 0) return prev;
      return arrayMove(prev, oldIndex, newIndex);
    });
  }, []);

  return {
    customAttributes,
    auditLog,
    toast,
    hideToast,
    addAttribute,
    updateAttribute,
    deleteAttribute,
    reorderCustomAttributes,
    replaceCustomAttributes,
  };
}
