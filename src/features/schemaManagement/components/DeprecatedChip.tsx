import type { FC } from "react";
import { Chip, Tooltip } from "@mui/material";
import CaretDownIcon from "@diligentcorp/atlas-react-bundle/icons/CaretDown";
import { STR } from "../../../utils/i18n.js";

interface Props {
  reason?: string;
}

/**
 * Muted chip for attributes removed from the active schema (recently deleted list).
 * Optional reason is shown in a tooltip on hover.
 */
export const DeprecatedChip: FC<Props> = ({ reason }) => {
  const chip = (
    <Chip
      label={STR.recentlyDeleted}
      size="small"
      icon={<CaretDownIcon />}
      aria-label={reason ? `${STR.recentlyDeleted}: ${reason}` : STR.recentlyDeleted}
      sx={{ height: 18, fontSize: "0.65rem", "& .MuiChip-icon": { fontSize: "0.75rem", marginRight: "-6px" } }}
    />
  );

  if (!reason) return chip;

  return (
    <Tooltip title={reason} placement="top" arrow>
      {/* span needed so Tooltip can attach to a non-interactive element */}
      <span style={{ cursor: "help" }}>{chip}</span>
    </Tooltip>
  );
};
