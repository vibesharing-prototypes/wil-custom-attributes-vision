import type { FC, ReactNode } from "react";
import { useCallback } from "react";
import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Box } from "@mui/material";
import type { AttributeDefinition } from "../../../types/attribute.js";
import { STR } from "../../../utils/i18n.js";
import { uiDividerDefaultBorderColor } from "../../../utils/uiDividerBorder.js";
import { AttributeListRow } from "./AttributeListRow.js";

interface SortableRowProps {
  id: string;
  attribute: AttributeDefinition;
  dragHandleLabel: string;
  onEdit: (a: AttributeDefinition) => void;
  /** While dragging, opacity of the list source row (default 0.92 — form preview uses a lower value + DragOverlay). */
  draggingSourceOpacity?: number;
}

export const SortableAttributeRow: FC<SortableRowProps> = ({
  id,
  attribute,
  dragHandleLabel,
  onEdit,
  draggingSourceOpacity = 0.92,
}) => {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handle: ReactNode = (
    <Box
      ref={setActivatorNodeRef}
      {...attributes}
      {...listeners}
      sx={({ tokens }) => ({
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 36,
        flexShrink: 0,
        cursor: isDragging ? "grabbing" : "grab",
        touchAction: "none",
        color: tokens.semantic.color.type?.muted?.value ?? "text.secondary",
        borderRadius: 1,
        "&:focus-visible": {
          outline: "2px solid",
          outlineColor: tokens.semantic.color.type?.default?.value ?? "currentColor",
          outlineOffset: 2,
        },
      })}
      aria-label={`${dragHandleLabel}: ${attribute.name}`}
    >
      <Box
        aria-hidden
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "3px",
          py: 0.5,
        }}
      >
        <Box sx={{ width: 14, height: 2, borderRadius: 1, bgcolor: "currentColor" }} />
        <Box sx={{ width: 14, height: 2, borderRadius: 1, bgcolor: "currentColor" }} />
        <Box sx={{ width: 14, height: 2, borderRadius: 1, bgcolor: "currentColor" }} />
      </Box>
    </Box>
  );

  return (
    <Box ref={setNodeRef} style={style} sx={{ opacity: isDragging ? draggingSourceOpacity : 1 }}>
      <AttributeListRow
        attribute={attribute}
        dragHandle={handle}
        suppressRowActions
        onEdit={onEdit}
      />
    </Box>
  );
};

interface Props {
  attributes: AttributeDefinition[];
  onEdit: (attribute: AttributeDefinition) => void;
  onReorder: (activeId: string, overId: string) => void;
  /** When true, draws a divider between rows (schema management reorder zone). */
  withRowDividers?: boolean;
}

/**
 * Drag-and-drop reorder for custom attributes (prototype). Uses a dedicated handle on the left;
 * accordions stay collapsed while reordering to avoid competing interactions.
 */
export const SortableCustomAttributeList: FC<Props> = ({
  attributes,
  onEdit,
  onReorder,
  withRowDividers = false,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (over && active.id !== over.id) {
        onReorder(String(active.id), String(over.id));
      }
    },
    [onReorder],
  );

  const ids = attributes.map((a) => a.id);

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <Box sx={{ overflow: "hidden" }}>
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
                onEdit={onEdit}
              />
            </Box>
          ))}
        </Box>
      </SortableContext>
    </DndContext>
  );
};
