import type { FC } from "react";
import { Box, ButtonBase, Chip, Stack, Typography } from "@mui/material";
import TextIcon from "@diligentcorp/atlas-react-bundle/icons/Text";
import CharacterIcon from "@diligentcorp/atlas-react-bundle/icons/Character";
import NumberIcon from "@diligentcorp/atlas-react-bundle/icons/Number";
import CalendarIcon from "@diligentcorp/atlas-react-bundle/icons/Calendar";
import TimeAndDateIcon from "@diligentcorp/atlas-react-bundle/icons/TimeAndDate";
import DropdownIcon from "@diligentcorp/atlas-react-bundle/icons/Dropdown";
import MultiselectIcon from "@diligentcorp/atlas-react-bundle/icons/Multiselect";
import AvatarIcon from "@diligentcorp/atlas-react-bundle/icons/Avatar";
import GroupIcon from "@diligentcorp/atlas-react-bundle/icons/Group";
import BooleanIcon from "@diligentcorp/atlas-react-bundle/icons/Boolean";
import CircleLineIcon from "@diligentcorp/atlas-react-bundle/icons/CircleLine";
import AttachIcon from "@diligentcorp/atlas-react-bundle/icons/Attach";
import LinkIcon from "@diligentcorp/atlas-react-bundle/icons/Link";
import EmailIcon from "@diligentcorp/atlas-react-bundle/icons/Email";
import CallIcon from "@diligentcorp/atlas-react-bundle/icons/Call";

import type { AttributeType } from "../../../types/attribute.js";
import { TYPE_LABELS, STR } from "../../../utils/i18n.js";

/**
 * The subset of attribute types available in the initial BOS integration.
 * Reflects known BOS configuration constraints as of Q1. Multi-select was recently
 * added to BOS; additional types (currency, attachment, users, contact) are expected
 * in Q2 once the BOS mapping work is complete.
 *
 * Reference: https://piedpiper.attribute-types-configuration.diligentoneplatform.com/
 */
export const BOS_ALLOWED_TYPES: AttributeType[] = [
  "text",
  "longText",
  "number",
  "date",
  "dateTime",
  "boolean",
  "singleSelect",
  "multiSelect",
  "user",
];

interface TypeEntry {
  type: AttributeType;
  Icon: FC<{ "aria-hidden"?: boolean }>;
  group: string;
}

const TYPE_ENTRIES: TypeEntry[] = [
  { type: "text", Icon: TextIcon, group: "Text" },
  { type: "longText", Icon: CharacterIcon, group: "Text" },
  { type: "number", Icon: NumberIcon, group: "Numeric" },
  { type: "currency", Icon: CircleLineIcon, group: "Numeric" },
  { type: "date", Icon: CalendarIcon, group: "Date & time" },
  { type: "dateTime", Icon: TimeAndDateIcon, group: "Date & time" },
  { type: "boolean", Icon: BooleanIcon, group: "Choice" },
  { type: "singleSelect", Icon: DropdownIcon, group: "Choice" },
  { type: "multiSelect", Icon: MultiselectIcon, group: "Choice" },
  { type: "user", Icon: AvatarIcon, group: "People" },
  { type: "users", Icon: GroupIcon, group: "People" },
  { type: "attachment", Icon: AttachIcon, group: "Media" },
  { type: "url", Icon: LinkIcon, group: "Contact" },
  { type: "email", Icon: EmailIcon, group: "Contact" },
  { type: "phone", Icon: CallIcon, group: "Contact" },
];

const GROUPS = ["Text", "Numeric", "Date & time", "Choice", "People", "Media", "Contact"];

interface Props {
  value: AttributeType | null;
  onChange: (type: AttributeType) => void;
  /** If true, show the selected type inline and a "Change type" button instead of the full grid */
  collapsed?: boolean;
  onChangeType?: () => void;
  /**
   * When provided, only these types are selectable. Types outside this list are hidden.
   * Used for the BOS-constrained view to surface only the types available in the current
   * BOS configuration.
   */
  allowedTypes?: AttributeType[];
}

/**
 * Step 1 of progressive disclosure: the type selector.
 *
 * Full mode: shows all 15 types grouped into a responsive grid.
 * Collapsed mode: shows the selected type chip + "Change type" link (create flow only).
 */
export const AttributeTypeSelector: FC<Props> = ({ value, onChange, collapsed, onChangeType, allowedTypes }) => {
  const visibleEntries = allowedTypes
    ? TYPE_ENTRIES.filter((e) => allowedTypes.includes(e.type))
    : TYPE_ENTRIES;
  if (collapsed && value) {
    const entry = TYPE_ENTRIES.find((e) => e.type === value);
    const Icon = entry?.Icon;
    return (
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack direction="row" alignItems="center" gap={1}>
          {Icon && (
            <Box
              sx={({ tokens, palette }) => ({
                color: tokens.semantic.color.type?.primary?.value ?? palette.primary.main,
                display: "flex",
                alignItems: "center",
              })}
            >
              <Icon aria-hidden />
            </Box>
          )}
          <Typography variant="body2" fontWeight={500}>
            {TYPE_LABELS[value]}
          </Typography>
        </Stack>
        {onChangeType && (
          <Typography
            component="button"
            variant="body2"
            onClick={onChangeType}
            sx={{ background: "none", border: "none", cursor: "pointer", color: "primary.main", padding: 0, textDecoration: "underline" }}
          >
            {STR.form.changeType}
          </Typography>
        )}
      </Stack>
    );
  }

  return (
    <Stack gap={2}>
      <Box>
        <Typography variant="subtitle2" gutterBottom>
          {STR.form.chooseType}
        </Typography>
        <Typography
          variant="body2"
              sx={({ tokens }) => ({ color: tokens.semantic.color.type?.muted?.value ?? "text.secondary" })}
        >
          {STR.form.chooseTypeHint}
        </Typography>
      </Box>
      {GROUPS.map((group) => {
        const entries = visibleEntries.filter((e) => e.group === group);
        if (entries.length === 0) return null;
        return (
          <Box key={group}>
            <Typography
              variant="overline"
              sx={({ tokens }) => ({
                color: tokens.semantic.color.type?.muted?.value ?? "text.secondary",
                fontWeight: tokens.semantic.fontWeight?.emphasis ?? 600,
                display: "block",
                mb: 0.5,
              })}
            >
              {group}
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                gap: 1,
              }}
            >
              {entries.map(({ type, Icon }) => {
                const selected = value === type;
                return (
                  <ButtonBase
                    key={type}
                    onClick={() => onChange(type)}
                    aria-pressed={selected}
                    aria-label={TYPE_LABELS[type]}
                    sx={({ tokens }) => ({
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      gap: 0.5,
                      p: 1.5,
                      borderRadius: 1,
                      border: "none",
                      boxShadow: selected
                        ? `inset 0 0 0 2px ${tokens.semantic.color.action.secondary.outline?.value ?? "#282e37"}`
                        // TODO: replace fallback with tokens.semantic.color.outline.static.value once token lands in bundle
                        : `inset 0 0 0 1px ${tokens.semantic.color.outline?.static?.value ?? "#E2E2E5"}`,
                      textAlign: "left",
                      transition: "background 0.15s, box-shadow 0.15s",
                      backgroundColor: selected
                        ? (tokens.semantic.color.action.secondary.activeFill?.value ?? "#e6e6e6")
                        : "transparent",
                      "&:hover": {
                        boxShadow: selected
                          ? `inset 0 0 0 2px ${tokens.semantic.color.action.secondary.outline?.value ?? "#282e37"}`
                          : `inset 0 0 0 1px ${tokens.semantic.color.outline?.hover?.value ?? "#464e53"}`,
                        backgroundColor: selected
                          ? (tokens.semantic.color.action.secondary.activeFill?.value ?? "#e6e6e6")
                          : (tokens.semantic.color.action.secondary.hoverFill?.value ?? "#f3f3f3"),
                      },
                      "&:focus-visible": {
                        outline: `2px solid ${tokens.semantic.color.ui.focusRing?.value ?? "#0b4cce"}`,
                        outlineOffset: "1px",
                      },
                    })}
                  >
                    <Box
                      sx={({ tokens, palette }) => ({
                        color: selected
                          ? tokens.semantic.color.type?.primary?.value ?? palette.primary.main
                          : tokens.semantic.color.type?.secondary?.value ??
                            tokens.semantic.color.type?.muted?.value ??
                            "text.secondary",
                        display: "flex",
                      })}
                    >
                      <Icon aria-hidden />
                    </Box>
                    <Typography variant="caption" fontWeight={selected ? 600 : 400}>
                      {TYPE_LABELS[type]}
                    </Typography>
                  </ButtonBase>
                );
              })}
            </Box>
          </Box>
        );
      })}
    </Stack>
  );
};

/**
 * Returns the icon component for a given attribute type.
 * Used in list rows to show a type-appropriate icon.
 */
export function getTypeIcon(type: AttributeType): FC<{ "aria-hidden"?: boolean }> {
  return TYPE_ENTRIES.find((e) => e.type === type)?.Icon ?? TextIcon;
}

