import type { ChangeEvent, FC, KeyboardEvent } from "react";
import { useState } from "react";
import {
  Box,
  Chip,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import AddIcon from "@diligentcorp/atlas-react-bundle/icons/Add";
import TrashIcon from "@diligentcorp/atlas-react-bundle/icons/Trash";
import type { Option } from "../../../types/attribute.js";
import { STR } from "../../../utils/i18n.js";

// ─── Drag handle icon (inline SVG, no extra dependency) ──────────────────────
const DragHandleIcon: FC = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="currentColor"
    aria-hidden="true"
    focusable="false"
  >
    <rect x="3" y="3" width="10" height="2" rx="1" />
    <rect x="3" y="7" width="10" height="2" rx="1" />
    <rect x="3" y="11" width="10" height="2" rx="1" />
  </svg>
);

// ─── Single sortable row ──────────────────────────────────────────────────────
interface SortableOptionRowProps {
  option: Option;
  onRemove: (id: string) => void;
}

const SortableOptionRow: FC<SortableOptionRowProps> = ({ option, onRemove }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: option.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : "auto",
  };

  return (
    <ListItem
      ref={setNodeRef}
      style={style}
      disableGutters
      disablePadding
      secondaryAction={
        <IconButton
          size="small"
          aria-label={`Remove option "${option.label}"`}
          onClick={() => onRemove(option.id)}
          edge="end"
        >
          <TrashIcon aria-hidden />
        </IconButton>
      }
      sx={{ pr: 5, py: 0.25 }}
    >
      {/* Drag handle */}
      <Box
        component="span"
        {...attributes}
        {...listeners}
        sx={{
          cursor: isDragging ? "grabbing" : "grab",
          display: "flex",
          alignItems: "center",
          mr: 1,
          color: "text.disabled",
          touchAction: "none",
          "&:hover": { color: "text.secondary" },
          "&:focus-visible": {
            outline: "2px solid",
            outlineColor: "primary.main",
            borderRadius: 0.5,
          },
        }}
        aria-label={`Drag to reorder "${option.label}"`}
      >
        <DragHandleIcon />
      </Box>

      <Chip label={option.label} size="small" variant="outlined" />
    </ListItem>
  );
};

// ─── Main editor ─────────────────────────────────────────────────────────────
interface Props {
  options: Option[];
  onChange: (options: Option[]) => void;
}

/**
 * Inline option editor for singleSelect and multiSelect attribute types.
 * Options can be added (Enter or click +), removed, and reordered via drag-and-drop.
 */
export const SelectOptionsEditor: FC<Props> = ({ options, onChange }) => {
  const [draft, setDraft] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const addOption = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    const duplicate = options.some(
      (o) => o.label.toLowerCase() === trimmed.toLowerCase(),
    );
    if (duplicate) return;
    onChange([...options, { id: `opt-${Date.now()}`, label: trimmed }]);
    setDraft("");
  };

  const removeOption = (id: string) => {
    onChange(options.filter((o) => o.id !== id));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addOption();
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = options.findIndex((o) => o.id === active.id);
      const newIndex = options.findIndex((o) => o.id === over.id);
      onChange(arrayMove(options, oldIndex, newIndex));
    }
  };

  return (
    <Stack gap={1}>
      <Typography variant="subtitle2">{STR.form.optionsLabel}</Typography>

      {options.length === 0 ? (
        <Typography
          variant="body2"
          sx={({ tokens }) => ({
            color: tokens.semantic.color.type?.muted?.value ?? "text.secondary",
            py: 0.5,
          })}
        >
          {STR.form.noOptionsYet}
        </Typography>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={options.map((o) => o.id)}
            strategy={verticalListSortingStrategy}
          >
            <List disablePadding dense>
              {options.map((opt) => (
                <SortableOptionRow
                  key={opt.id}
                  option={opt}
                  onRemove={removeOption}
                />
              ))}
            </List>
          </SortableContext>
        </DndContext>
      )}

      {/* Add new option */}
      <Box>
        <TextField
          value={draft}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={STR.form.addOptionPlaceholder}
          size="small"
          fullWidth
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    aria-label={STR.form.addOptionLabel}
                    onClick={addOption}
                    disabled={!draft.trim()}
                  >
                    <AddIcon aria-hidden />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
        <Typography
          variant="caption"
          sx={({ tokens }) => ({
            color: tokens.semantic.color.type?.muted?.value ?? "text.secondary",
            mt: 0.5,
            display: "block",
          })}
        >
          Press Enter to add
        </Typography>
      </Box>
    </Stack>
  );
};
