import type { FC } from "react";
import { Box, Chip, Stack, Typography } from "@mui/material";
import type { AttributeDefinition } from "../../../types/attribute.js";
import type { AttributeState } from "../AttributeRenderer/AttributeRenderer.types.js";
import { STR } from "../../../utils/i18n.js";

interface Props {
  definition: AttributeDefinition;
  value?: unknown;
  state?: AttributeState;
}

type UserValue = { name?: string; displayName?: string; inactive?: boolean };

/**
 * Renders the value of an attribute in read-only or interactive state.
 * All 12 canonical attribute types are handled.
 * Interactive states (default, filled, error, disabled) are stubs for M1.
 */
export const AttributeValue: FC<Props> = ({ definition, value }) => {
  const { type, options, currencyMode } = definition;

  const isEmpty = value == null || (Array.isArray(value) && value.length === 0);

  if (isEmpty) {
    return (
      <Typography
        variant="body2"
        sx={({ tokens }) => ({ color: tokens.semantic.color.type.muted.value, mt: 0.5 })}
      >
        {STR.noValue}
      </Typography>
    );
  }

  switch (type) {
    case "text":
      return (
        <Typography variant="body2" sx={{ mt: 0.5 }}>
          {String(value)}
        </Typography>
      );

    case "longText":
      return (
        <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: "pre-wrap" }}>
          {String(value)}
        </Typography>
      );

    case "number":
      return (
        <Typography variant="body2" sx={{ mt: 0.5 }}>
          {new Intl.NumberFormat().format(Number(value))}
        </Typography>
      );

    case "date": {
      const d = new Date(String(value));
      return (
        <Typography variant="body2" component="time" dateTime={d.toISOString()} sx={{ mt: 0.5 }}>
          {d.toLocaleDateString()}
        </Typography>
      );
    }

    case "dateTime": {
      const d = new Date(String(value));
      return (
        <Typography variant="body2" component="time" dateTime={d.toISOString()} sx={{ mt: 0.5 }}>
          {d.toLocaleString()}
        </Typography>
      );
    }

    case "boolean":
      return (
        <Typography variant="body2" sx={{ mt: 0.5 }}>
          {value ? STR.yes : STR.no}
        </Typography>
      );

    case "singleSelect": {
      const opt = options?.find((o) => o.id === value);
      if (!opt) return <Typography variant="body2" sx={{ mt: 0.5 }}>{String(value)}</Typography>;
      return (
        <Box sx={{ mt: 0.5 }}>
          <Chip
            label={opt.deprecated ? `${opt.label} (${STR.deprecated})` : opt.label}
            size="small"
            variant={opt.deprecated ? "outlined" : "filled"}
          />
        </Box>
      );
    }

    case "multiSelect": {
      const ids = Array.isArray(value) ? (value as string[]) : [];
      return (
        <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ mt: 0.5 }}>
          {ids.map((id) => {
            const opt = options?.find((o) => o.id === id);
            const label = opt
              ? opt.deprecated
                ? `${opt.label} (${STR.deprecated})`
                : opt.label
              : String(id);
            return (
              <Chip
                key={id}
                label={label}
                size="small"
                variant={opt?.deprecated ? "outlined" : "filled"}
              />
            );
          })}
        </Stack>
      );
    }

    case "user": {
      const u = value as UserValue;
      const name = u.name ?? u.displayName ?? String(value);
      return (
        <Box sx={{ mt: 0.5 }}>
          <Chip
            label={u.inactive ? `${name} (${STR.inactive})` : name}
            size="small"
            variant={u.inactive ? "outlined" : "filled"}
          />
        </Box>
      );
    }

    case "users": {
      const arr = Array.isArray(value) ? (value as UserValue[]) : [];
      return (
        <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ mt: 0.5 }}>
          {arr.map((u, i) => {
            const name = u.name ?? u.displayName ?? String(u);
            return (
              <Chip
                key={i}
                label={u.inactive ? `${name} (${STR.inactive})` : name}
                size="small"
                variant={u.inactive ? "outlined" : "filled"}
              />
            );
          })}
        </Stack>
      );
    }

    case "currency": {
      const v =
        typeof value === "object" && value !== null && "amount" in value
          ? (value as { amount: number; currency?: string })
          : { amount: Number(value), currency: undefined };
      const code = v.currency ?? (currencyMode === "perAttribute" ? "USD" : "");
      const amount = Number.isFinite(v.amount) ? v.amount : 0;
      return (
        <Typography variant="body2" sx={{ mt: 0.5 }}>
          {code ? `${code} ` : ""}
          {new Intl.NumberFormat(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(amount)}
        </Typography>
      );
    }

    case "attachment": {
      const files = Array.isArray(value)
        ? (value as Array<{ name: string; size?: string }>)
        : [];
      return (
        <Stack component="ul" gap={0.25} sx={{ mt: 0.5, pl: 2, m: 0 }}>
          {files.map((f, i) => (
            <Typography key={i} component="li" variant="body2">
              {f.name}
              {f.size && (
                <Typography
                  component="span"
                  variant="caption"
                  sx={({ tokens }) => ({
                    color: tokens.semantic.color.type.muted.value,
                    ml: 0.5,
                  })}
                >
                  · {f.size}
                </Typography>
              )}
            </Typography>
          ))}
        </Stack>
      );
    }

    case "url": {
      const href = String(value);
      return (
        <Typography
          variant="body2"
          component="a"
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          sx={({ tokens }) => ({
            mt: 0.5,
            display: "block",
            color: tokens.semantic.color.type.link?.value ?? "primary.main",
            wordBreak: "break-all",
          })}
        >
          {href}
        </Typography>
      );
    }

    case "email": {
      const addr = String(value);
      return (
        <Typography
          variant="body2"
          component="a"
          href={`mailto:${addr}`}
          sx={({ tokens }) => ({
            mt: 0.5,
            display: "block",
            color: tokens.semantic.color.type.link?.value ?? "primary.main",
          })}
        >
          {addr}
        </Typography>
      );
    }

    case "phone": {
      const num = String(value);
      return (
        <Typography
          variant="body2"
          component="a"
          href={`tel:${num}`}
          sx={({ tokens }) => ({
            mt: 0.5,
            display: "block",
            color: tokens.semantic.color.type.link?.value ?? "primary.main",
          })}
        >
          {num}
        </Typography>
      );
    }

    default:
      return (
        <Typography variant="body2" sx={{ mt: 0.5 }}>
          {String(value)}
        </Typography>
      );
  }
};
