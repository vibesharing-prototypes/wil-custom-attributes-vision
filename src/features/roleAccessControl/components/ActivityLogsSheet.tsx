import type { FC } from "react";
import { useState } from "react";
import {
  Box,
  Button,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import ArrowLeftIcon from "@diligentcorp/atlas-react-bundle/icons/ArrowLeft";
import { DesktopDateRangePicker } from "@mui/x-date-pickers-pro";
import { SingleInputDateRangeField } from "@mui/x-date-pickers-pro/SingleInputDateRangeField";
import type { DateRange } from "@mui/x-date-pickers-pro";
import { format, subDays } from "date-fns";
import { STR } from "../../../utils/i18n.js";
import { uiDividerDefaultBorderColor } from "../../../utils/uiDividerBorder.js";

/** Default range: last 30 days up to today */
function defaultDateRange(): DateRange<Date> {
  const today = new Date();
  return [subDays(today, 30), today];
}

interface Props {
  open: boolean;
  onClose: () => void;
}

const SHEET_ID = "activity-logs-sheet";
const TITLE_ID = "activity-logs-sheet-title";

const steps = [
  STR.activityLogs.step1,
  STR.activityLogs.step2,
  STR.activityLogs.step3,
] as const;

export const ActivityLogsSheet: FC<Props> = ({ open, onClose }) => {
  const [dateRange, setDateRange] = useState<DateRange<Date>>(defaultDateRange);
  const [isGenerating, setIsGenerating] = useState(false);

  const dayOfWeekFormatter = (day: Date) => format(day, "EEEEEE");

  const handleGenerate = () => {
    setIsGenerating(true);
    // Simulate async request
    setTimeout(() => {
      setIsGenerating(false);
      onClose();
    }, 1200);
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      id={SHEET_ID}
      PaperProps={{
        role: "dialog",
        "aria-labelledby": TITLE_ID,
        "aria-modal": "true",
        sx: {
          width: { xs: "100%", sm: 480 },
          maxWidth: "100vw",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {/* Header */}
      <Box
        sx={({ tokens }) => ({
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 2,
          py: 1.5,
          borderBottom: "1px solid",
          borderColor: uiDividerDefaultBorderColor(tokens),
          flexShrink: 0,
        })}
      >
        <IconButton
          onClick={onClose}
          size="small"
          aria-label={STR.activityLogs.close}
          edge="start"
        >
          <ArrowLeftIcon />
        </IconButton>
        <Typography
          id={TITLE_ID}
          variant="h2"
          component="h2"
          sx={{ fontWeight: 600, fontSize: "1.25rem", lineHeight: 1.4 }}
        >
          {STR.activityLogs.sheetTitle}
        </Typography>
      </Box>

      {/* Content */}
      <Box
        sx={{ flex: 1, overflow: "auto", minHeight: 0, px: 3, py: 3 }}
        aria-label={STR.activityLogs.sheetTitle}
      >
        <Stack gap={3}>
          {/* Steps */}
          <Stack gap={1}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {STR.activityLogs.stepsTitle}
            </Typography>
            <List disablePadding dense>
              {steps.map((step, index) => (
                <ListItem key={index} disableGutters sx={{ alignItems: "flex-start", py: 0.25 }}>
                  <ListItemText
                    primary={
                      <Typography variant="body2">
                        {index + 1}.&nbsp;{step}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Stack>

          {/* Date range picker */}
          <Stack gap={1}>
            <DesktopDateRangePicker
              value={dateRange}
              onChange={(newRange) => setDateRange(newRange)}
              closeOnSelect={false}
              maxSpan={{ days: 31 }}
              slots={{ field: SingleInputDateRangeField }}
              slotProps={{
                textField: {
                  helperText: STR.activityLogs.dateRangeHelperText,
                  fullWidth: true,
                },
                actionBar: {
                  actions: ["cancel", "accept"],
                },
              }}
              dayOfWeekFormatter={dayOfWeekFormatter}
              localeText={{
                cancelButtonLabel: "Cancel",
                okButtonLabel: "Confirm",
              }}
            />
          </Stack>

          {/* Generate button */}
          <Box>
            <Button
              variant="contained"
              color="primary"
              onClick={handleGenerate}
              disabled={isGenerating || dateRange[0] == null || dateRange[1] == null}
            >
              {isGenerating ? STR.activityLogs.generating : STR.activityLogs.generateButton}
            </Button>
          </Box>
        </Stack>
      </Box>
    </Drawer>
  );
};
