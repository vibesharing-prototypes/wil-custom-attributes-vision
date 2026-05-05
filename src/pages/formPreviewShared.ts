import { useCallback, useMemo, useState } from "react";
import type { AttributeDefinition, ObjectSchema } from "../types/attribute.js";
import { riskSchema, initialCustomAttributes } from "../features/schemaViewer/sampleData.js";

/** sessionStorage key — custom attribute order and section placement (shared form preview ↔ context preview). */
const FORM_PREVIEW_CUSTOM_ORDER_STORAGE_KEY = "formPreview.customAttributeOrderIds.v1";

export type FormPreviewCustomAttributesPersisted = {
  orderIds: string[];
  /** Effective section id per custom attribute id (subset of schema section ids). */
  sectionByAttrId?: Record<string, string>;
};

function isRecordOfStrings(value: unknown): value is Record<string, string> {
  if (!value || typeof value !== "object") return false;
  return Object.entries(value as Record<string, unknown>).every(
    ([k, v]) => typeof k === "string" && typeof v === "string",
  );
}

function loadPersistedFormPreviewCustomAttributes(): FormPreviewCustomAttributesPersisted | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(FORM_PREVIEW_CUSTOM_ORDER_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) {
      if (!parsed.every((id) => typeof id === "string")) return null;
      return { orderIds: parsed };
    }
    if (parsed && typeof parsed === "object" && Array.isArray((parsed as FormPreviewCustomAttributesPersisted).orderIds)) {
      const p = parsed as FormPreviewCustomAttributesPersisted;
      if (!p.orderIds.every((id) => typeof id === "string")) return null;
      const sectionByAttrId = p.sectionByAttrId && isRecordOfStrings(p.sectionByAttrId) ? p.sectionByAttrId : undefined;
      return { orderIds: p.orderIds, sectionByAttrId };
    }
    return null;
  } catch {
    return null;
  }
}

export function persistFormPreviewCustomAttributes(defs: AttributeDefinition[], schema: ObjectSchema = riskSchema): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    const orderIds = defs.map((a) => a.id);
    const sections = schema.sections ?? [];
    const sectionIdSet = new Set(sections.map((s) => s.id));
    const fallbackSectionId = sections[0]?.id ?? "overview";
    const sectionByAttrId: Record<string, string> = {};
    for (const a of defs) {
      const sid = a.sectionId && sectionIdSet.has(a.sectionId) ? a.sectionId : fallbackSectionId;
      sectionByAttrId[a.id] = sid;
    }
    const payload: FormPreviewCustomAttributesPersisted = { orderIds, sectionByAttrId };
    sessionStorage.setItem(FORM_PREVIEW_CUSTOM_ORDER_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* quota / private mode */
  }
}

/**
 * Applies a stored id order to the canonical custom-attribute list (definitions always match sample data).
 */
export function orderedCustomAttributesFromPersistedOrder(
  canonical: AttributeDefinition[],
  orderIds: string[] | null,
): AttributeDefinition[] {
  if (!orderIds?.length) return structuredClone(canonical);
  const map = new Map(canonical.map((a) => [a.id, structuredClone(a)]));
  const result: AttributeDefinition[] = [];
  const used = new Set<string>();
  for (const id of orderIds) {
    if (used.has(id)) continue;
    const def = map.get(id);
    if (def) {
      result.push(def);
      used.add(id);
    }
  }
  for (const a of canonical) {
    if (!used.has(a.id)) result.push(structuredClone(a));
  }
  return result;
}

/**
 * Applies persisted section ids to cloned definitions, then applies id order.
 */
export function orderedCustomAttributesFromPersistence(
  canonical: AttributeDefinition[],
  persisted: FormPreviewCustomAttributesPersisted | null,
  schema: ObjectSchema = riskSchema,
): AttributeDefinition[] {
  if (!persisted) return structuredClone(canonical);
  let withSections = structuredClone(canonical);
  if (persisted.sectionByAttrId) {
    const sectionIdSet = new Set((schema.sections ?? []).map((s) => s.id));
    const fallbackSectionId = schema.sections?.[0]?.id ?? "overview";
    withSections = withSections.map((a) => {
      const sid = persisted.sectionByAttrId?.[a.id];
      if (!sid) return a;
      const resolved = sectionIdSet.has(sid) ? sid : fallbackSectionId;
      return { ...a, sectionId: resolved };
    });
  }
  return orderedCustomAttributesFromPersistedOrder(withSections, persisted.orderIds);
}

/** Groups custom attributes by schema section (display order follows `orderedCustomAttributes`). */
export function partitionCustomAttributesBySchemaSections(
  orderedCustomAttributes: AttributeDefinition[],
  schema: ObjectSchema = riskSchema,
): {
  id: string;
  name: string;
  attributes: AttributeDefinition[];
}[] {
  const sections = schema.sections ?? [];
  if (sections.length === 0) {
    return [{ id: "all", name: "All", attributes: [...orderedCustomAttributes] }];
  }
  const sectionIdSet = new Set(sections.map((s) => s.id));
  const fallbackSectionId = sections[0]?.id ?? "overview";
  const customBySection = new Map<string, AttributeDefinition[]>();
  for (const s of sections) {
    customBySection.set(s.id, []);
  }
  for (const attr of orderedCustomAttributes) {
    const targetId = attr.sectionId && sectionIdSet.has(attr.sectionId) ? attr.sectionId : fallbackSectionId;
    customBySection.get(targetId)?.push(attr);
  }
  return sections.map((s) => ({
    id: s.id,
    name: s.name,
    attributes: customBySection.get(s.id) ?? [],
  }));
}

/** Resolved section id for a custom attribute (used for in-page reorder guards). */
export function effectiveCustomAttributeSectionId(
  attr: AttributeDefinition,
  schema: ObjectSchema = riskSchema,
): string {
  const sections = schema.sections ?? [];
  if (sections.length === 0) return "all";
  const sectionIdSet = new Set(sections.map((s) => s.id));
  const fallbackSectionId = sections[0]?.id ?? "overview";
  return attr.sectionId && sectionIdSet.has(attr.sectionId) ? attr.sectionId : fallbackSectionId;
}

/**
 * Applies sessionStorage order + section placement to a canonical custom-attribute list for the given schema.
 */
export function getCustomAttributesHydratedFromPersistence(
  canonical: AttributeDefinition[],
  schema: ObjectSchema = riskSchema,
): AttributeDefinition[] {
  return orderedCustomAttributesFromPersistence(
    structuredClone(canonical),
    loadPersistedFormPreviewCustomAttributes(),
    schema,
  );
}

function getOrderedCustomAttributesForPreviewSync(): AttributeDefinition[] {
  return getCustomAttributesHydratedFromPersistence(structuredClone(initialCustomAttributes), riskSchema);
}

/** Route for the imagined host-app record shell (no prototype side nav). */
export const FORM_PREVIEW_DESTINATION_ROUTE = "/explorations/form-preview/destination";

export type FormPreviewSectionSpec = { id: string; title: string; attributes: AttributeDefinition[] };

/**
 * Merges OOTB schema attributes (per section.attributeIds) with custom attributes (by `sectionId`).
 */
export function buildMergedSchemaSections(
  schema: ObjectSchema,
  orderedCustomAttributes: AttributeDefinition[],
): FormPreviewSectionSpec[] {
  const sections = schema.sections ?? [];
  const attrMap = new Map(schema.attributes.map((a) => [a.id, a]));

  if (sections.length === 0) {
    return [{ id: "all", title: "All", attributes: [...schema.attributes, ...orderedCustomAttributes] }];
  }

  const sectionIdSet = new Set(sections.map((s) => s.id));
  const fallbackSectionId = sections[0]?.id ?? "overview";

  const customBySection = new Map<string, AttributeDefinition[]>();
  for (const s of sections) {
    customBySection.set(s.id, []);
  }
  for (const attr of orderedCustomAttributes) {
    const targetId = attr.sectionId && sectionIdSet.has(attr.sectionId) ? attr.sectionId : fallbackSectionId;
    customBySection.get(targetId)?.push(attr);
  }

  return sections.map((section) => {
    const sectionAttrs = section.attributeIds
      .map((id) => attrMap.get(id))
      .filter((a): a is AttributeDefinition => a != null);
    const customAttrs = customBySection.get(section.id) ?? [];

    return { id: section.id, title: section.name, attributes: [...sectionAttrs, ...customAttrs] };
  });
}

/**
 * Build preview sections for the Risk sample schema (form preview / destination).
 */
export function buildFormPreviewSections(orderedCustomAttributes: AttributeDefinition[]): FormPreviewSectionSpec[] {
  return buildMergedSchemaSections(riskSchema, orderedCustomAttributes);
}

export function useFormPreviewAttributeOrder() {
  const [orderedCustomAttributes, setOrderedCustomAttributes] = useState<AttributeDefinition[]>(() =>
    getOrderedCustomAttributesForPreviewSync(),
  );
  const [toastOpen, setToastOpen] = useState(false);

  const hideToast = useCallback(() => setToastOpen(false), []);

  const handleReorderSave = useCallback((next: AttributeDefinition[]) => {
    setOrderedCustomAttributes(next);
    persistFormPreviewCustomAttributes(next);
    setToastOpen(true);
  }, []);

  const sections = useMemo(
    () => buildFormPreviewSections(orderedCustomAttributes),
    [orderedCustomAttributes],
  );

  return {
    orderedCustomAttributes,
    toastOpen,
    hideToast,
    handleReorderSave,
    sections,
  };
}

/**
 * Sections for the context preview — same Score-section custom order as the form preview after Save
 * (persisted in sessionStorage for this tab).
 */
export function usePersistedFormPreviewSections() {
  return useMemo(() => buildFormPreviewSections(getOrderedCustomAttributesForPreviewSync()), []);
}
