import { useState, type FC } from "react";
import { Box, Link, Typography } from "@mui/material";
import { STR } from "../../../utils/i18n.js";

interface Props {
  /** Used as the element's id, referenced by aria-describedby on the attribute section. */
  id: string;
  text?: string;
}

/** Threshold in characters above which the description is clamped with a "More" control. */
const CLAMP_THRESHOLD = 220;

/**
 * Renders the semantic description for an attribute as inline helper text.
 * Long descriptions are clamped with an accessible expand control.
 *
 * Description placement decision (M0): inline helper text below the label.
 * Source: attributeTypeDecisions.md
 */
export const AttributeDescription: FC<Props> = ({ id, text }) => {
  const [expanded, setExpanded] = useState(false);

  if (!text) return null;

  const isClamped = text.length > CLAMP_THRESHOLD && !expanded;
  const displayText = isClamped ? text.slice(0, CLAMP_THRESHOLD) + "…" : text;

  return (
    <Box id={id} sx={{ mt: 0.25 }}>
      <Typography
        variant="body2"
        component="div"
        sx={({ tokens }) => ({ color: tokens.semantic.color.type.muted.value })}
      >
        {displayText}
        {isClamped && (
          <>
            {" "}
            <Link
              component="button"
              type="button"
              underline="hover"
              onClick={() => setExpanded(true)}
              sx={{
                p: 0,
                m: 0,
                border: 0,
                background: "none",
                verticalAlign: "baseline",
                fontSize: "inherit",
                lineHeight: "inherit",
                fontWeight: "inherit",
                letterSpacing: "inherit",
                fontFamily: "inherit",
                display: "inline",
                cursor: "pointer",
              }}
            >
              {STR.more}
            </Link>
          </>
        )}
      </Typography>
    </Box>
  );
};
