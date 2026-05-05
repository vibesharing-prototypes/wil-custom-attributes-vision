import type { FC } from "react";
import {
  Box,
  FormControl,
  FormControlLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Typography,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import type { PermissionLevel, SectionPermissionMode } from "./types.js";
import { STR } from "../../utils/i18n.js";

const LEVELS: readonly (PermissionLevel | "custom")[] = ["none", "view", "edit", "custom"];

/** Section card: `Select` below this width; inline radios from this width up (aligned with two-column custom layout). */
const SECTION_CARD_MODE_RADIO_UP_PX = 1200;

function modeLabel(mode: SectionPermissionMode): string {
  if (mode === "custom") return STR.roleAccess.customToggle;
  if (mode === "none") return STR.roleAccess.levelNone;
  if (mode === "view") return STR.roleAccess.levelView;
  return STR.roleAccess.levelEdit;
}

export interface SectionPermissionModePickProps {
  value: SectionPermissionMode;
  onChange: (mode: SectionPermissionMode) => void;
  disabled?: boolean;
  name: string;
  ariaLabel?: string;
}

/**
 * Section card control: None, View, Edit, or Custom (per-attribute picks).
 * Compact `Select` below 1200px; inline radios from 1200px up (per-attribute rows use {@link PermissionLevelPick}).
 */
export const SectionPermissionModePick: FC<SectionPermissionModePickProps> = ({
  value,
  onChange,
  disabled,
  name,
  ariaLabel,
}) => {
  const onSelect = (e: SelectChangeEvent<SectionPermissionMode>) => {
    onChange(e.target.value as SectionPermissionMode);
  };

  const selectInputProps = { "aria-label": ariaLabel ?? STR.roleAccess.allowPermissionsTitle };

  return (
    <Box
      sx={({ breakpoints }) => ({
        flexShrink: 0,
        alignSelf: "flex-start",
        minWidth: 0,
        maxWidth: "100%",
        [breakpoints.up(SECTION_CARD_MODE_RADIO_UP_PX)]: {
          alignSelf: "center",
          maxWidth: "none",
        },
      })}
    >
      <Box
        sx={({ breakpoints }) => ({
          display: "none",
          [breakpoints.up(SECTION_CARD_MODE_RADIO_UP_PX)]: {
            display: "block",
          },
        })}
      >
        <RadioGroup
          row
          name={name}
          value={value}
          disabled={disabled}
          onChange={(_, v) => onChange(v as SectionPermissionMode)}
          aria-label={ariaLabel ?? STR.roleAccess.allowPermissionsTitle}
          sx={{
            flexDirection: "row",
            flexWrap: "wrap",
            columnGap: "16px",
            rowGap: 1,
            m: 0,
            "& .MuiFormControlLabel-root": { mr: 0, ml: 0 },
          }}
        >
          {LEVELS.map((level) => (
            <FormControlLabel
              key={level}
              value={level}
              control={<Radio size="small" color="primary" disableRipple disabled={disabled} />}
              sx={{
                mr: 0,
                ml: 0,
                columnGap: "12px",
                alignItems: "center",
                "& .MuiFormControlLabel-label": { marginInlineStart: 0 },
              }}
              label={
                <Typography
                  variant="body1"
                  component="span"
                  sx={{
                    color: value === level ? "primary.main" : "text.secondary",
                  }}
                >
                  {modeLabel(level)}
                </Typography>
              }
            />
          ))}
        </RadioGroup>
      </Box>

      <Box
        sx={({ breakpoints }) => ({
          display: "block",
          width: "fit-content",
          maxWidth: "100%",
          [breakpoints.up(SECTION_CARD_MODE_RADIO_UP_PX)]: {
            display: "none",
          },
        })}
      >
        <FormControl disabled={disabled} sx={{ minWidth: 0, maxWidth: "100%" }}>
          <Select<SectionPermissionMode>
            value={value}
            onChange={onSelect}
            variant="outlined"
            inputProps={selectInputProps}
            sx={{
              minWidth: "6.5rem",
              maxWidth: "100%",
              "& .MuiSelect-select": { py: 0.75 },
            }}
          >
            <MenuItem value="none">{STR.roleAccess.levelNone}</MenuItem>
            <MenuItem value="view">{STR.roleAccess.levelView}</MenuItem>
            <MenuItem value="edit">{STR.roleAccess.levelEdit}</MenuItem>
            <MenuItem value="custom">{STR.roleAccess.customToggle}</MenuItem>
          </Select>
        </FormControl>
      </Box>
    </Box>
  );
};
