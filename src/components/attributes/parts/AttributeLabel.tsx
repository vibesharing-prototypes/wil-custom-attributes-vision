import type { FC } from "react";
import { Box, Typography } from "@mui/material";
import { STR } from "../../../utils/i18n.js";

interface Props {
  /** Maps to aria-labelledby on the containing section. */
  id: string;
  label: string;
  required?: boolean;
}

export const AttributeLabel: FC<Props> = ({ id, label, required }) => {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
      <Typography
        component="label"
        variant="body2"
        id={id}
        sx={{ fontWeight: 600 }}
      >
        {label}
      </Typography>
      {required && (
        <>
          <Typography
            component="span"
            variant="body2"
            aria-hidden="true"
            sx={{ color: "error.main", fontWeight: 700, lineHeight: 1 }}
          >
            *
          </Typography>
          {/* Screen-reader-accessible required indicator */}
          <Box component="span" className="sr-only">
            ({STR.required})
          </Box>
        </>
      )}
    </Box>
  );
};
