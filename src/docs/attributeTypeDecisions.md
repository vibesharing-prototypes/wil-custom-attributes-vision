# Attribute type decisions (M0)

Decisions recorded here apply to both the read-only schema viewer (M0) and
the attribute rendering on the object detail/edit view (M1+).

## Canonical type set

12 types, exactly as defined in M1 PRD FR-2. Do not add or remove types without
consulting the PRDs.

| Type | Code |
|---|---|
| Short text | `text` |
| Long text | `longText` |
| Number | `number` |
| Date | `date` |
| Date & time | `dateTime` |
| Single select | `singleSelect` |
| Multi-select | `multiSelect` |
| User | `user` |
| Users | `users` |
| Boolean | `boolean` |
| Currency | `currency` |
| Attachment | `attachment` |

**`link` is not a type in the spec.** URL/Email/Phone handling is an open question (M1 Q4) —
likely handled as `text` with format hints rather than a distinct type.

## Per-type decisions

**Boolean**
Render as **"Yes" / "No" text** in read-only. No toggle UI in view mode.

**Currency**
Support both `perAttribute` and `perValue` modes. Default for prototyping: `perAttribute` (USD).
Per-attribute vs. per-value decision is still open (M1 Q1).

**Attachment**
Support **multiple** file uploads. Read-only shows a simple bulleted list of filenames.
Single vs. multiple decision is still open (M1 Q2); defaulting to multiple until resolved.

**Single select / Multi-select**
Deprecated options append **(Deprecated)** label in read-only display.
Deprecated options use `variant="outlined"` Chip to visually distinguish them.

**User / Users**
Inactive users append **(Inactive)** label. Rendered as Chips.
Group selection is out of scope (M1 Q3 open); `allowGroups: false` default.

**Date**
Display using `toLocaleDateString()`. No time component.

**Date & time**
Display using `toLocaleString()`. Includes both date and time.
Rendered as a `<time>` element with ISO 8601 `dateTime` attribute for machine readability.

## Description placement

**Inline helper text** below the label, before the value.
Long descriptions (>220 characters) are clamped with an accessible "More" expand control.
Optional tooltip for extended guidance: not implemented in M0 (open question M0 §4.6 Q2).

## Deprecated attribute treatment

In the schema management list (M1): show a "Deprecated" badge alongside the type label.
In the object detail/edit view (M1): deprecated attributes are hidden from create/edit forms;
existing data is preserved and shown in read-only views.
