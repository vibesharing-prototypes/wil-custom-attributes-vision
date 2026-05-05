import { Box, Chip, Stack, Typography } from "@mui/material";

import { PROTOTYPE_DEPLOYMENT_META } from "../prototypeDeploymentMeta.js";

const optionalNote =
  typeof import.meta.env.VITE_DEPLOYMENT_NOTE === "string"
    ? import.meta.env.VITE_DEPLOYMENT_NOTE.trim()
    : "";

/**
 * Fixed foot of the left navigation rail so the active prototype deployment is obvious in screenshots and reviews.
 */
export function NavigationDeploymentIndicator() {
  const { channelLabel, purposeLine } = PROTOTYPE_DEPLOYMENT_META;

  return (
    <Box
      component="section"
      role="region"
      aria-label="Prototype deployment"
      sx={{
        px: 2,
        py: 1.25,
        flexShrink: 0,
      }}
    >
      <Stack gap={0.75}>
        <Chip label={channelLabel} size="small" sx={{ alignSelf: "flex-start", fontWeight: 600 }} />
        <Typography variant="caption" color="text.secondary" component="p" sx={{ m: 0, lineHeight: 1.4 }}>
          {purposeLine}
        </Typography>
        {optionalNote ? (
          <Typography
            variant="caption"
            color="text.secondary"
            component="p"
            sx={{ m: 0, lineHeight: 1.4, fontStyle: "italic" }}
          >
            {optionalNote}
          </Typography>
        ) : null}
      </Stack>
    </Box>
  );
}
