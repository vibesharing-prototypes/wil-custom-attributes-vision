import type { FC, ReactNode } from "react";
import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import {
  DndContext,
  DragOverlay,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";
import type { AttributeDefinition, ObjectSchema } from "../../../types/attribute.js";
import {
  effectiveCustomAttributeSectionId,
  partitionCustomAttributesBySchemaSections,
} from "../../../pages/formPreviewShared.js";
import { SortableAttributeRow } from "./SortableCustomAttributeList.js";
import { AttributeListRow } from "./AttributeListRow.js";
import { uiDividerDefaultBorderColor } from "../../../utils/uiDividerBorder.js";
import { STR } from "../../../utils/i18n.js";

const SECTION_EMPTY_PREFIX = "section-empty-";
const SECTION_TAIL_PREFIX = "section-tail-";

export function isEmptyDroppableId(id: string): boolean {
  return id.startsWith(SECTION_EMPTY_PREFIX);
}

export function isTailDroppableId(id: string): boolean {
  return id.startsWith(SECTION_TAIL_PREFIX);
}

function sectionIdFromEmptyDroppable(id: string) {
  return id.slice(SECTION_EMPTY_PREFIX.length);
}

function sectionIdFromTailDroppable(id: string) {
  return id.slice(SECTION_TAIL_PREFIX.length);
}

type SectionGroup = { id: string; name: string; attributes: AttributeDefinition[] };

function findSectionIdForAttributeId(groups: SectionGroup[], attrId: string): string | null {
  for (const g of groups) {
    if (g.attributes.some((a) => a.id === attrId)) return g.id;
  }
  return null;
}

function flattenFromGroups(groups: SectionGroup[]): AttributeDefinition[] {
  return groups.flatMap((g) => g.attributes);
}

function cloneGroups(groups: SectionGroup[]): SectionGroup[] {
  return groups.map((g) => ({ ...g, attributes: [...g.attributes] }));
}

/**
 * Removes the attribute from its current section bucket and inserts it into `toSectionId`
 * at `targetIndexInTargetSection` (0-based within the target list before insert).
 * Updates the moved attribute's `sectionId` to the new section.
 */
export function buildCrossSectionDraft(
  prev: AttributeDefinition[],
  activeId: string,
  toSectionId: string,
  targetIndexInTargetSection: number,
  schema: ObjectSchema,
): AttributeDefinition[] {
  const groups = cloneGroups(partitionCustomAttributesBySchemaSections(prev, schema));
  const activeSection = findSectionIdForAttributeId(groups, activeId);
  if (!activeSection) return prev;

  const fromIdx = groups.findIndex((g) => g.id === activeSection);
  const toIdx = groups.findIndex((g) => g.id === toSectionId);
  if (fromIdx < 0 || toIdx < 0) return prev;

  const fromList = groups[fromIdx].attributes;
  const pullIdx = fromList.findIndex((a) => a.id === activeId);
  if (pullIdx < 0) return prev;
  const [moved] = fromList.splice(pullIdx, 1);
  const updated: AttributeDefinition = { ...moved, sectionId: toSectionId };
  const toList = groups[toIdx].attributes;
  const insertAt = Math.min(Math.max(0, targetIndexInTargetSection), toList.length);
  toList.splice(insertAt, 0, updated);
  return flattenFromGroups(groups);
}

type PendingMove = {
  attributeName: string;
  fromSectionName: string;
  toSectionName: string;
  nextDraft: AttributeDefinition[];
};

/** While dragging, set to a section id when the pointer is over a *different* section (valid cross-section drop). */
const SectionReorderDropHighlightContext = createContext<{
  crossSectionDropHighlightSectionId: string | null;
}>({ crossSectionDropHighlightSectionId: null });

export function useSectionReorderCrossSectionHighlight(sectionId: string): boolean {
  const { crossSectionDropHighlightSectionId } = useContext(SectionReorderDropHighlightContext);
  return crossSectionDropHighlightSectionId === sectionId;
}

const noop = () => {};

interface SectionEmptyDropZoneProps {
  sectionId: string;
  label: string;
}

/** Renders a dashed "drop here" area for sections that currently have no custom attributes. */
export const SectionEmptyDropZone: FC<SectionEmptyDropZoneProps> = ({ sectionId, label }) => {
  const id = `${SECTION_EMPTY_PREFIX}${sectionId}`;
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <Box
      ref={setNodeRef}
      sx={({ tokens, palette }) => {
        const accentBorder =
          tokens.semantic.color.type?.primary?.value ??
          tokens.semantic.color.border?.accent?.value ??
          palette.primary.main;
        const focusRing = tokens.semantic.color.ui?.focusRing?.value ?? accentBorder;
        return {
          minHeight: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 2,
          borderRadius: 1,
          border: "1px dashed",
          borderColor: isOver ? accentBorder : "divider",
          bgcolor: isOver
            ? tokens.semantic.color.surface?.subtle?.value ?? "action.selected"
            : "transparent",
          boxShadow: isOver ? `0 0 0 2px ${focusRing}` : "none",
          color: tokens.semantic.color.type?.muted?.value ?? "text.secondary",
          transition: "border-color 120ms ease, background-color 120ms ease, box-shadow 120ms ease",
        };
      }}
    >
      <Typography variant="body2" textAlign="center">
        {label}
      </Typography>
    </Box>
  );
};

interface SectionTailDropZoneProps {
  sectionId: string;
}

/** Thin droppable strip at the end of a section; lets users drop attributes at the bottom. */
export const SectionTailDropZone: FC<SectionTailDropZoneProps> = ({ sectionId }) => {
  const id = `${SECTION_TAIL_PREFIX}${sectionId}`;
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <Box
      ref={setNodeRef}
      aria-hidden
      sx={({ tokens }) => ({
        minHeight: 12,
        mx: -0.5,
        borderRadius: 1,
        bgcolor: isOver ? tokens.semantic.color.surface?.subtle?.value ?? "action.hover" : "transparent",
      })}
    />
  );
};

interface SectionSortableAttributesProps {
  sectionId: string;
  attributes: AttributeDefinition[];
  withRowDividers?: boolean;
  /** Opacity for the source row while dragging. */
  draggingSourceOpacity?: number;
}

/**
 * Renders a SortableContext scoped to one section so dnd-kit groups the section's items.
 * Use inside a parent DndContext from `SectionedReorderDndProvider`.
 */
export const SectionSortableAttributes: FC<SectionSortableAttributesProps> = ({
  sectionId,
  attributes,
  withRowDividers = false,
  draggingSourceOpacity = 0.34,
}) => {
  const ids = useMemo(() => attributes.map((a) => a.id), [attributes]);
  return (
    <SortableContext id={sectionId} items={ids} strategy={verticalListSortingStrategy}>
      <Box sx={{ overflow: "visible" }}>
        {attributes.map((attr, index) => (
          <Box
            key={attr.id}
            sx={
              withRowDividers && index < attributes.length - 1
                ? ({ tokens }) => ({
                    borderBottom: "1px solid",
                    borderColor: uiDividerDefaultBorderColor(tokens),
                  })
                : undefined
            }
          >
            <SortableAttributeRow
              id={attr.id}
              attribute={attr}
              dragHandleLabel={STR.schemaManagement.dragHandleReorder}
              draggingSourceOpacity={draggingSourceOpacity}
              onEdit={noop}
            />
          </Box>
        ))}
      </Box>
    </SortableContext>
  );
};

interface SectionedReorderDndProviderProps {
  draft: AttributeDefinition[];
  setDraft: (next: AttributeDefinition[]) => void;
  schema: ObjectSchema;
  /** When false, renders children without DnD wiring. */
  enabled?: boolean;
  children: ReactNode;
}

/**
 * Page-level DndContext for the inline reorder experience.
 *
 * - Same-section drags `arrayMove` the draft immediately.
 * - Cross-section drags open a confirmation Dialog (matches the form-preview side-sheet
 *   behavior) before applying the new `sectionId` and order.
 *
 * Children render the per-section `SectionSortableAttributes` and drop zones.
 */
const SectionedReorderDndProviderInner: FC<Omit<SectionedReorderDndProviderProps, "enabled">> = ({
  draft,
  setDraft,
  schema,
  children,
}) => {
  const draftRef = useRef(draft);
  draftRef.current = draft;

  const [pendingMove, setPendingMove] = useState<PendingMove | null>(null);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [crossSectionDropHighlightSectionId, setCrossSectionDropHighlightSectionId] = useState<string | null>(null);

  const dropHighlightCtx = useMemo(
    () => ({ crossSectionDropHighlightSectionId }),
    [crossSectionDropHighlightSectionId],
  );

  const activeDragAttribute = useMemo(
    () => (activeDragId ? draft.find((a) => a.id === activeDragId) ?? null : null),
    [activeDragId, draft],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveDragId(String(event.active.id));
    setCrossSectionDropHighlightSectionId(null);
  }, []);

  const handleDragCancel = useCallback(() => {
    setActiveDragId(null);
    setCrossSectionDropHighlightSectionId(null);
  }, []);

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const activeId = String(event.active.id);
      const overId = event.over ? String(event.over.id) : null;
      const prev = draftRef.current;
      const g0 = partitionCustomAttributesBySchemaSections(prev, schema);
      const activeSection = findSectionIdForAttributeId(g0, activeId);
      if (!activeSection || !overId) {
        setCrossSectionDropHighlightSectionId(null);
        return;
      }
      let overSection: string | null = null;
      if (isEmptyDroppableId(overId)) {
        overSection = sectionIdFromEmptyDroppable(overId);
      } else if (isTailDroppableId(overId)) {
        overSection = sectionIdFromTailDroppable(overId);
      } else {
        overSection = findSectionIdForAttributeId(g0, overId);
      }
      if (!overSection || activeSection === overSection) {
        setCrossSectionDropHighlightSectionId(null);
      } else {
        setCrossSectionDropHighlightSectionId(overSection);
      }
    },
    [schema],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveDragId(null);
      setCrossSectionDropHighlightSectionId(null);
      const { active, over } = event;
      if (!over) return;
      const activeId = String(active.id);
      const overId = String(over.id);
      if (activeId === overId) return;

      const prev = draftRef.current;
      const g0 = partitionCustomAttributesBySchemaSections(prev, schema);
      const activeSection = findSectionIdForAttributeId(g0, activeId);
      if (!activeSection) return;

      let overSection: string | null = null;
      if (isEmptyDroppableId(overId)) {
        overSection = sectionIdFromEmptyDroppable(overId);
      } else if (isTailDroppableId(overId)) {
        overSection = sectionIdFromTailDroppable(overId);
      } else {
        overSection = findSectionIdForAttributeId(g0, overId);
      }
      if (!overSection) return;

      if (activeSection === overSection) {
        if (isEmptyDroppableId(overId)) return;
        const section = g0.find((k) => k.id === activeSection);
        if (!section) return;
        const oldIndex = section.attributes.findIndex((a) => a.id === activeId);
        if (oldIndex < 0) return;
        let newIndex: number;
        if (isTailDroppableId(overId)) {
          newIndex = section.attributes.length - 1;
        } else {
          newIndex = section.attributes.findIndex((a) => a.id === overId);
        }
        if (newIndex < 0 || oldIndex === newIndex) return;
        const nextAttrs = arrayMove(section.attributes, oldIndex, newIndex);
        const nextGroups = g0.map((g) => (g.id === activeSection ? { ...g, attributes: nextAttrs } : g));
        setDraft(flattenFromGroups(nextGroups));
        return;
      }

      // Cross-section move → confirmation dialog.
      const attr = prev.find((a) => a.id === activeId);
      if (!attr) return;
      const fromG = g0.find((g) => g.id === activeSection);
      const toG = g0.find((g) => g.id === overSection);
      if (!fromG || !toG) return;

      let insertIndex: number;
      if (isTailDroppableId(overId)) {
        insertIndex = toG.attributes.length;
      } else if (isEmptyDroppableId(overId)) {
        insertIndex = 0;
      } else {
        const idx = toG.attributes.findIndex((a) => a.id === overId);
        insertIndex = idx >= 0 ? idx : toG.attributes.length;
      }

      const nextDraft = buildCrossSectionDraft(prev, activeId, overSection, insertIndex, schema);
      setPendingMove({
        attributeName: attr.name,
        fromSectionName: fromG.name,
        toSectionName: toG.name,
        nextDraft,
      });
    },
    [schema, setDraft],
  );

  const handleConfirmMove = useCallback(() => {
    if (!pendingMove) return;
    setDraft(pendingMove.nextDraft);
    setPendingMove(null);
  }, [pendingMove, setDraft]);

  const handleDismissDialog = useCallback(() => {
    setPendingMove(null);
  }, []);

  const dragOverlayHandle = (
    <Box
      aria-hidden
      sx={({ tokens }) => ({
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 36,
        flexShrink: 0,
        color: tokens.semantic.color.type?.muted?.value ?? "text.secondary",
      })}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: "3px", py: 0.5 }}>
        <Box sx={{ width: 14, height: 2, borderRadius: 1, bgcolor: "currentColor" }} />
        <Box sx={{ width: 14, height: 2, borderRadius: 1, bgcolor: "currentColor" }} />
        <Box sx={{ width: 14, height: 2, borderRadius: 1, bgcolor: "currentColor" }} />
      </Box>
    </Box>
  );

  return (
    <>
      <SectionReorderDropHighlightContext.Provider value={dropHighlightCtx}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragCancel={handleDragCancel}
          onDragEnd={handleDragEnd}
        >
          {children}

          <DragOverlay dropAnimation={null}>
          {activeDragAttribute ? (
            <Box
              sx={({ tokens, shadows }) => ({
                width: "min(calc(100vw - 48px), 672px)",
                maxWidth: "100%",
                boxShadow: shadows[12],
                borderRadius: 1,
                border: "none",
                bgcolor: tokens.semantic.color.surface?.default?.value ?? "background.paper",
                cursor: "grabbing",
              })}
            >
              <AttributeListRow
                attribute={activeDragAttribute}
                dragHandle={dragOverlayHandle}
                suppressRowActions
                onEdit={noop}
              />
            </Box>
          ) : null}
        </DragOverlay>
        </DndContext>
      </SectionReorderDropHighlightContext.Provider>

      <Dialog
        open={pendingMove != null}
        onClose={handleDismissDialog}
        aria-labelledby="schema-inline-move-section-dialog-title"
      >
        <DialogTitle id="schema-inline-move-section-dialog-title">
          {STR.formPreview.moveAttributeSectionDialogTitle}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            {pendingMove
              ? STR.formPreview.moveAttributeSectionDialogBody(
                  pendingMove.attributeName,
                  pendingMove.fromSectionName,
                  pendingMove.toSectionName,
                )
              : null}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button variant="outlined" color="primary" onClick={handleDismissDialog}>
            {STR.form.cancel}
          </Button>
          <Button variant="contained" color="primary" onClick={handleConfirmMove}>
            {STR.formPreview.moveAttributeSectionConfirm}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

/** Conditionally wraps children in the DnD provider; when disabled, just renders children. */
export const SectionedReorderDndProvider: FC<SectionedReorderDndProviderProps> = ({
  enabled = true,
  ...rest
}) => {
  if (!enabled) return <>{rest.children}</>;
  return <SectionedReorderDndProviderInner {...rest} />;
};

export function effectiveSectionForDraftAttribute(
  attr: AttributeDefinition,
  schema: ObjectSchema,
): string {
  return effectiveCustomAttributeSectionId(attr, schema);
}
