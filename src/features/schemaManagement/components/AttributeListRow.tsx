import { useState, type FC, type MouseEvent } from "react";
import type { ReactNode } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  Link,
  Stack,
  Typography,
} from "@mui/material";

import type { AttributeDefinition } from "../../../types/attribute.js";
import { TYPE_LABELS, STR } from "../../../utils/i18n.js";
import { getTypeIcon } from "./AttributeTypeSelector.js";
import { DeprecatedChip } from "./DeprecatedChip.js";
import HistoryIcon from "@diligentcorp/atlas-react-bundle/icons/History";

import ExpandDownIcon from "@diligentcorp/atlas-react-bundle/icons/ExpandDown";
import { uiDividerDefaultBorderColor } from "../../../utils/uiDividerBorder.js";

interface Props {
  attribute: AttributeDefinition;
  /** If true, no edit/history buttons are shown (for OOTB attributes) */
  readonly?: boolean;
  onEdit?: (attribute: AttributeDefinition) => void;
  onViewHistory?: (attribute: AttributeDefinition) => void;
  /** Drag handle (reorder mode). When set, accordion stays collapsed so drag does not compete with expand. */
  dragHandle?: ReactNode;
  /** Hides row actions (e.g. while reordering). */
  suppressRowActions?: boolean;
  /** Removes summary bottom edge so the row sits flush against a sibling container (e.g. dashed reorder zone). */
  flatBottom?: boolean;
}

/**
 * A single row in the schema management list, rendered as an accordion.
 * The summary shows attribute name, type, and a 1-line truncated description.
 * Expanding the row reveals a "Changes" link, the full description, and options.
 * OOTB (base schema) attributes have no origin chip; custom attributes show a "Custom" chip. OOTB rows have no write actions.
 */
export const AttributeListRow: FC<Props> = ({
  attribute,
  readonly,
  onEdit,
  onViewHistory,
  dragHandle,
  suppressRowActions,
  flatBottom,
}) => {
  const { name, type, lifecycleStatus, deprecationReason, semanticDescription, isOotb, options } =
    attribute;

  const TypeIcon = getTypeIcon(type);
  const isDeprecated = lifecycleStatus === "deprecated";
  const hasOptions = (type === "singleSelect" || type === "multiSelect") && options && options.length > 0;
  const showChangesLink = !readonly && !suppressRowActions && !!onViewHistory;
  const hasExpandableContent = !!semanticDescription || hasOptions || showChangesLink;
  const accordionUnlocked = !dragHandle;
  const showAccordionExpand = accordionUnlocked && hasExpandableContent;

  const [expanded, setExpanded] = useState(false);

  const stopPropagation = (e: MouseEvent) => e.stopPropagation();

  return (
    <Accordion
      data-atlas-alignment="end"
      disableGutters
      elevation={0}
      expanded={showAccordionExpand ? expanded : false}
      onChange={showAccordionExpand ? (_, isExpanded) => setExpanded(isExpanded) : undefined}
      sx={({ tokens }) => ({
        opacity: isDeprecated ? 0.65 : 1,
        "&:before": { display: "none" },
        boxShadow: "none",
        border: "none",
        ...(flatBottom
          ? {
              borderBottom: "none",
              "& .MuiAccordionSummary-root": {
                borderBottom: "none",
              },
            }
          : {}),
        "&.Mui-expanded": { margin: 0 },
        // Override Atlas theme rotation when expand is shown; hide wrapper entirely when locked (reorder mode).
        "& .MuiAccordionSummary-expandIconWrapper": showAccordionExpand
          ? { transform: "rotate(0deg)" }
          : { display: "none" },
        "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": showAccordionExpand
          ? { transform: "rotate(180deg)" }
          : { display: "none" },
      })}
    >
      <AccordionSummary
        expandIcon={showAccordionExpand ? <ExpandDownIcon /> : false}
        aria-controls={showAccordionExpand ? `attr-${attribute.id}-details` : undefined}
        id={`attr-${attribute.id}-header`}
        sx={{
          px: 2,
          minHeight: 0,
          "& .MuiAccordionSummary-content": {
            my: 1.5,
            mr: 1,
            minWidth: 0,
            alignItems: "center",
          },
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          gap={2}
          sx={{ width: "100%", minWidth: 0 }}
        >
          {/* Left: optional drag handle + type icon + name + chips + type label + truncated description */}
          <Stack direction="row" alignItems="center" gap={1.5} sx={{ minWidth: 0, flex: 1 }}>
            {dragHandle}
            <Box
              sx={({ tokens }) => ({
                color:
                  tokens.semantic.color.type?.secondary?.value ??
                  tokens.semantic.color.type?.muted?.value ??
                  "text.secondary",
                display: "flex",
                flexShrink: 0,
              })}
            >
              <TypeIcon aria-hidden />
            </Box>

            <Box sx={{ minWidth: 0 }}>
              <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
                <Typography
                  variant="body2"
                  fontWeight={500}
                  sx={{
                    textDecoration: isDeprecated ? "line-through" : "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  {name}
                </Typography>

                {isDeprecated && <DeprecatedChip reason={deprecationReason} />}

                {!isOotb && (
                  <Chip
                    label={STR.custom}
                    size="small"
                    variant="outlined"
                    sx={({ tokens }) => ({
                      height: 18,
                      fontSize: "0.65rem",
                      borderColor: uiDividerDefaultBorderColor(tokens),
                    })}
                  />
                )}
              </Stack>

              {/* Type label + 1-line truncated description */}
              <Stack direction="row" alignItems="center" gap={0.75} sx={{ mt: 0.25, minWidth: 0 }}>
                <Typography
                  variant="caption"
                  sx={({ tokens }) => ({
                    color: tokens.semantic.color.type?.muted?.value ?? "text.secondary",
                    flexShrink: 0,
                  })}
                >
                  {TYPE_LABELS[type]}
                </Typography>
                {semanticDescription && (
                  <Box sx={{ display: "contents" }}>
                    <Typography
                      aria-hidden="true"
                      variant="caption"
                      sx={({ tokens }) => ({
                        color: tokens.semantic.color.type?.muted?.value ?? "text.secondary",
                        flexShrink: 0,
                        opacity: expanded ? 0 : 1,
                        transition: "opacity 0.2s ease",
                      })}
                    >
                      ·
                    </Typography>
                    <Typography
                      variant="caption"
                      aria-hidden={expanded}
                      sx={({ tokens }) => ({
                        color: tokens.semantic.color.type?.muted?.value ?? "text.secondary",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        minWidth: 0,
                        opacity: expanded ? 0 : 1,
                        transition: "opacity 0.2s ease",
                      })}
                    >
                      {semanticDescription}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Box>
          </Stack>

          {/* Right: action buttons — stopPropagation prevents accordion toggle on click */}
          {!readonly && !suppressRowActions && (
            <Stack
              direction="row"
              alignItems="center"
              gap={0.25}
              flexShrink={0}
              onClick={stopPropagation}
            >
              {!isDeprecated && onEdit && (
                <Button
                  variant="text"
                  size="small"
                  onClick={() => onEdit(attribute)}
                  aria-label={`Edit attribute "${name}"`}
                >
                  {STR.schemaManagement.editAttribute}
                </Button>
              )}
            </Stack>
          )}
        </Stack>
      </AccordionSummary>

      {showAccordionExpand && (
        <AccordionDetails
          id={`attr-${attribute.id}-details`}
          sx={{ px: 2, pt: 0, pb: 2 }}
        >
          <Stack gap={1.5}>
            {/* Changes link — shown first, before description */}
            {showChangesLink && (
              <Box>
                <Link
                  component="button"
                  underline="always"
                  onClick={() => onViewHistory!(attribute)}
                  aria-label={`View change history for "${name}"`}
                  sx={{
                    fontSize: "0.75rem",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 0.5,
                    cursor: "pointer",
                  }}
                >
                  <Box component="span" sx={{ display: "inline-flex", fontSize: "0.9rem", alignItems: "center" }}>
                    <HistoryIcon aria-hidden />
                  </Box>
                  {STR.auditLog.changesButton}
                </Link>
              </Box>
            )}

            {semanticDescription && (
              <Box>
                <Typography
                  sx={({ tokens }) => ({
                    fontFamily: tokens.semantic.font.label.sm.fontFamily,
                    fontSize: tokens.semantic.font.label.sm.fontSize,
                    fontWeight: tokens.semantic.fontWeight.emphasis,
                    letterSpacing: tokens.semantic.font.label.sm.letterSpacing,
                    lineHeight: tokens.semantic.font.label.sm.lineHeight,
                    textTransform: tokens.semantic.font.label.sm.textTransform,
                    color: tokens.semantic.color.type?.muted?.value ?? "text.secondary",
                    display: "block",
                    mb: 0.75,
                  })}
                >
                  {STR.form.descriptionLabel}
                </Typography>
                <Typography
                  variant="body2"
                  sx={({ tokens }) => ({ color: tokens.semantic.color.type?.muted?.value ?? "text.secondary" })}
                >
                  {semanticDescription}
                </Typography>
              </Box>
            )}

            {hasOptions && (
              <Box>
                <Typography
                  sx={({ tokens }) => ({
                    fontFamily: tokens.semantic.font.label.sm.fontFamily,
                    fontSize: tokens.semantic.font.label.sm.fontSize,
                    fontWeight: tokens.semantic.fontWeight.emphasis,
                    letterSpacing: tokens.semantic.font.label.sm.letterSpacing,
                    lineHeight: tokens.semantic.font.label.sm.lineHeight,
                    textTransform: tokens.semantic.font.label.sm.textTransform,
                    color: tokens.semantic.color.type?.muted?.value ?? "text.secondary",
                    display: "block",
                    mb: 0.75,
                  })}
                >
                  Options
                </Typography>
                <Stack direction="row" flexWrap="wrap" gap={0.75}>
                  {options!.map((opt) => (
                    <Chip
                      key={opt.id}
                      label={opt.label}
                      size="small"
                      variant="outlined"
                      sx={
                        opt.deprecated
                          ? { textDecoration: "line-through", opacity: 0.5 }
                          : undefined
                      }
                    />
                  ))}
                </Stack>
              </Box>
            )}
          </Stack>
        </AccordionDetails>
      )}
    </Accordion>
  );
};
