import type { ChangeEvent, FC } from "react";
import { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import CloseIcon from "@diligentcorp/atlas-react-bundle/icons/Close";
import type { AttributeDefinition } from "../../../types/attribute.js";
import { STR } from "../../../utils/i18n.js";

interface Props {
  attribute: AttributeDefinition | null;
  onConfirm: (id: string, reason?: string) => void;
  onClose: () => void;
}

const D = STR.attributeDeletionDialog;

/**
 * Confirmation dialog before removing a custom attribute from the active schema.
 * Optional reason is recorded in change history only.
 */
export const DeleteAttributeDialog: FC<Props> = ({ attribute, onConfirm, onClose }) => {
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    if (!attribute) return;
    onConfirm(attribute.id, reason.trim() || undefined);
    setReason("");
    onClose();
  };

  const handleClose = () => {
    setReason("");
    onClose();
  };

  return (
    <Dialog
      open={!!attribute}
      onClose={handleClose}
      aria-labelledby="attribute-deletion-dialog-title"
      aria-describedby="attribute-deletion-dialog-description"
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle
        component="div"
        sx={{
          position: "relative",
          pr: 5,
          pl: 3,
          pt: 2,
          pb: 1,
          boxSizing: "border-box",
        }}
      >
        <IconButton
          aria-label="Close dialog"
          onClick={handleClose}
          color="inherit"
          size="small"
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon aria-hidden />
        </IconButton>
        <Stack gap={0.5} sx={{ alignItems: "flex-start", textAlign: "left", pr: 1, width: "100%" }}>
          <Typography
            id="attribute-deletion-dialog-title"
            component="h2"
            variant="h6"
            sx={{ m: 0, p: 0, width: "100%" }}
          >
            {D.title}
          </Typography>
          {attribute && (
            <Typography component="p" variant="body2" sx={{ m: 0, p: 0, fontWeight: 600, width: "100%" }}>
              {attribute.name}
            </Typography>
          )}
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ pt: 0, px: 3, pb: 2, boxSizing: "border-box" }}>
        <Stack gap={2} sx={{ alignItems: "stretch", textAlign: "left" }}>
          <Typography
            id="attribute-deletion-dialog-description"
            variant="body2"
            component="div"
            sx={{ m: 0, color: "text.secondary" }}
          >
            {D.subtitle}
          </Typography>
          <Typography variant="body2" component="div" sx={{ m: 0, color: "error.main", fontWeight: 600 }}>
            {D.permanenceNote}
          </Typography>
          <Typography variant="body2" component="div" sx={{ m: 0, color: "text.secondary" }}>
            {D.changeHistoryHint}
          </Typography>
          <TextField
            label={D.reasonLabel}
            value={reason}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setReason(e.target.value)}
            placeholder="e.g. Replaced by 'Regulatory classification'"
            fullWidth
            multiline
            minRows={2}
            helperText={D.reasonHint}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, boxSizing: "border-box" }}>
        <Button variant="outlined" onClick={handleClose}>
          {D.cancel}
        </Button>
        <Button
          variant="outlined"
          onClick={handleConfirm}
          autoFocus
          sx={({ tokens, palette }) => {
            const d = tokens?.semantic?.color?.action?.destructive;
            const fg = d?.default?.value ?? palette.error.main;
            const border = d?.outline?.value ?? d?.default?.value ?? palette.error.main;
            const hoverBorder =
              d?.hover?.value ?? d?.pressed?.value ?? palette.error.dark;
            const hoverBgFromTokens = d?.hoverFill?.value ?? d?.subtle?.value;
            let hoverBg = hoverBgFromTokens;
            if (!hoverBg) {
              try {
                hoverBg = alpha(
                  palette.error.main,
                  palette.mode === "dark" ? 0.16 : 0.08,
                );
              } catch {
                hoverBg =
                  palette.mode === "dark"
                    ? "rgba(244, 67, 54, 0.16)"
                    : "rgba(211, 47, 47, 0.08)";
              }
            }
            return {
              borderColor: border,
              color: fg,
              "&:hover": {
                borderColor: hoverBorder,
                backgroundColor: hoverBg,
                color: fg,
              },
              "&:focus-visible": {
                outline: `2px solid ${tokens?.semantic?.color?.ui?.focusRing?.value ?? palette.primary.main}`,
                outlineOffset: 1,
              },
            };
          }}
        >
          {D.confirm}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
