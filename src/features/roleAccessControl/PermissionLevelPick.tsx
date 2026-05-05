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
import type { PermissionLevel } from "./types.js";
import { STR } from "../../utils/i18n.js";

const LEVELS = ["none", "view", "edit"] as const;

export interface PermissionLevelPickProps {
  value: PermissionLevel;
  onChange: (level: PermissionLevel) => void;
  disabled?: boolean;
  /** Distinct `name` for the radio group (required for a11y when multiple groups exist). */
  name: string;
  /** Id of the visible attribute / row label (custom permissions). */
  ariaLabelledby?: string;
  /** Use when there is no visible label (e.g. accordion summary bulk control). */
  ariaLabel?: string;
}

/**
 * Responsive none / view / edit control for the role editor:
 * - **md and up** (tablet landscape + desktop): inline radios (12px control–label gap, 16px between options).
 * - **Below md**: compact single select to save horizontal space on narrow viewports.
 */
export const PermissionLevelPick: FC<PermissionLevelPickProps> = ({
  value,
  onChange,
  disabled,
  name,
  ariaLabelledby,
  ariaLabel,
}) => {
  const onSelect = (e: SelectChangeEvent<PermissionLevel>) => {
    onChange(e.target.value as PermissionLevel);
  };

  const selectInputProps =
    ariaLabelledby != null
      ? { "aria-labelledby": ariaLabelledby }
      : { "aria-label": ariaLabel ?? STR.roleAccess.allowPermissionsTitle };

  return (
    <Box
      sx={{
        flexShrink: 0,
        alignSelf: { xs: "flex-start", md: "center" },
        minWidth: 0,
        maxWidth: { xs: "100%", md: "none" },
      }}
    >
      <Box
        sx={(theme) => ({
          // Default hidden below md — avoid `display: { xs, md }` object form; some themes
          // omit the zero breakpoint and radios stay visible on narrow viewports.
          display: "none",
          [theme.breakpoints.up("md")]: {
            display: "block",
          },
        })}
      >
        <RadioGroup
          row
          name={name}
          value={value}
          disabled={disabled}
          onChange={(_, v) => onChange(v as PermissionLevel)}
          {...(ariaLabelledby != null
            ? { "aria-labelledby": ariaLabelledby }
            : { "aria-label": ariaLabel ?? STR.roleAccess.allowPermissionsTitle })}
          sx={{
            flexDirection: "row",
            flexWrap: "nowrap",
            columnGap: "16px",
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
                  {level === "none"
                    ? STR.roleAccess.levelNone
                    : level === "view"
                      ? STR.roleAccess.levelView
                      : STR.roleAccess.levelEdit}
                </Typography>
              }
            />
          ))}
        </RadioGroup>
      </Box>

      <Box
        sx={(theme) => ({
          display: "block",
          width: "fit-content",
          maxWidth: "100%",
          [theme.breakpoints.up("md")]: {
            display: "none",
          },
        })}
      >
        <FormControl disabled={disabled} sx={{ minWidth: 0, maxWidth: "100%" }}>
          <Select<PermissionLevel>
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
          </Select>
        </FormControl>
      </Box>
    </Box>
  );
};
