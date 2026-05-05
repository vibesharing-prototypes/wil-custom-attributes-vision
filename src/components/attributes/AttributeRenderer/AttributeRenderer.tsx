import type { FC } from "react";
import { Box, Typography } from "@mui/material";
import { AttributeDescription } from "../parts/AttributeDescription.js";
import { AttributeLabel } from "../parts/AttributeLabel.js";
import { AttributeValue } from "../parts/AttributeValue.js";
import type { AttributeRendererProps } from "./AttributeRenderer.types.js";
import { ariaDescribedBy } from "../../../utils/a11y.js";
import { STR, TYPE_LABELS } from "../../../utils/i18n.js";
import { uiDividerDefaultBorderColor } from "../../../utils/uiDividerBorder.js";

export const AttributeRenderer: FC<AttributeRendererProps> = ({
  definition,
  value,
  state = "readOnly",
  errorMessage,
}) => {
  const labelId = `label-${definition.id}`;
  const descId = `desc-${definition.id}`;
  const errId = `err-${definition.id}`;

  const describedBy = ariaDescribedBy([
    definition.semanticDescription ? descId : undefined,
    state === "error" && errorMessage ? errId : undefined,
  ]);

  return (
    <Box
      component="section"
      aria-describedby={describedBy}
      aria-invalid={state === "error" ? true : undefined}
      sx={({ tokens }) => ({
        py: 1.5,
        borderBottom: "1px solid",
        borderColor: uiDividerDefaultBorderColor(tokens),
        "&:last-of-type": { borderBottom: "none" },
      })}
    >
      <AttributeLabel id={labelId} label={definition.name} />

      {/* Type badge — helps Schema Administrators identify types at a glance */}
      <Typography
        variant="caption"
        sx={({ tokens }) => ({
          color: tokens.semantic.color.type.muted.value,
          display: "block",
          mt: 0.25,
        })}
      >
        {TYPE_LABELS[definition.type]}
        {definition.lifecycleStatus === "deprecated" && (
          <Box
            component="span"
            sx={{
              ml: 1,
              px: 0.75,
              py: 0.25,
              borderRadius: 1,
              backgroundColor: "action.hover",
              fontSize: "0.7rem",
              fontWeight: 500,
            }}
          >
            {STR.recentlyDeleted}
          </Box>
        )}
      </Typography>

      <AttributeDescription id={descId} text={definition.semanticDescription} />
      <AttributeValue definition={definition} value={value} state={state} />

      {state === "error" && errorMessage && (
        <Typography
          id={errId}
          role="alert"
          variant="caption"
          sx={{ color: "error.main", display: "block", mt: 0.5 }}
        >
          {errorMessage}
        </Typography>
      )}
    </Box>
  );
};

export default AttributeRenderer;
