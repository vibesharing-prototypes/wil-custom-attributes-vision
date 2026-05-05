# M0 checklist

- [ ] All 12 attribute types render in read-only with consistent label, type badge, description, and value
- [ ] Inline semantic description placement (clamped with "More" expand for long text)
- [ ] Required indicator (asterisk + screen-reader text) for required attributes
- [ ] Deprecated options display "(Deprecated)" label for singleSelect and multiSelect
- [ ] Deprecated attributes show "Deprecated" badge on type line
- [ ] Read-only schema viewer lists attributes in a flat list (no sections — M3)
- [ ] No edit, reorder, filters, or sections in M0
- [ ] Sample Risk schema covers all 12 types: text, longText, number, date, dateTime, singleSelect, multiSelect, user, users, boolean, currency, attachment
- [ ] Decisions recorded in `attributeTypeDecisions.md`
- [ ] Semantic descriptions authored for all sample attributes per quality guidelines

## Atlas MCP

Use the **Atlas MCP** (not Figma MCP) to look up design system information when implementing or refining M0:

- **Typography scale** — label variants, body, caption for label/description/value/type badge
- **Spacing** — gaps between label, type badge, description, and value
- **Required indicator** — confirm error color token path and placement
- **Helper/assistive text** — muted color token, font size, spacing
- **Chip** — size, variant for select options and user chips
- **Divider** — spacing between attribute rows
- **Error state** — `role="alert"`, error color token for errorMessage

See `semantic-descriptions-guidelines.md` and `attributeTypeDecisions.md` for M0-specific decisions.
