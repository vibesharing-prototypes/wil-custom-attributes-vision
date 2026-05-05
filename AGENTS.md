# Important rules

You are working in a prototype environment intended for product designers and developers to use the Atlas design system for the purpose of quick app prototyping.

Atlas relies on a heavily themed MUI setup, and a set of custom components that are authored by Atlas on top of MUI. Some type-level modifications are managed via TypeScript module augmentation of the theme.

MUI-X components are also available, and the MUI-X Pro license is automatically applied by the Theme Provider that is added by the `<AppLayout>` component from the `@diligentcorp/atlas-react-bundle` package.

Do not remove `<AppLayout>` from the application, since many feature, like `const { tokens, presets } = useTheme()` are available only inside the `<AppLayout>` component.

**Prefer using the design system over creating and defining custom components**, if there is one that fits the functional purpose you're trying to achieve. The goal is to create consistent prototypes that don't contain a lot of custom code or components.

Avoid installing and using shadcn/ui components, or any other third-party component sets, unless absolutely necessary for something specific that the design system does not provide, like charts.

## Atlas MCP server

**Always consult the Atlas MCP server** for the most up-to-date information about the list of components in the design system and their documentation.

While in a lot of cases the theme follows the default MUI API, often there are Atlas-specific ways to use them, and the documentation contains examples how to use components properly, as well as enhanced accessibility information.

The Atlas MCP server has been pre-configured in the project's mcp.json file, but you might need to ask the user to enable it in the MCP settings of Cursor, VS Code, or other MCP clients. Don't proceed with the task until the user has enabled the MCP server and you can get design system information from the server.

If you have trouble communicating with the MCP server, it could be that the pre-shared key in the mcp.json file is outdated.
Please prompt the user to get a new key from the Atlas documentation on Confluence.

## Atlas React Bundle dependency

We're using an https dependency in the package.json file to install the `@diligentcorp/atlas-react-bundle` package.

The contents of the bundle might change over time, so the integrity information in the package lock file might become outdated. You can always use forced methods to update the dependency or packages. Package lock files are intentionally ignored in the .gitignore file.

## Styling

Only use the MUI `sx` prop for custom styles!

For custom styles, colors, spacing, shadows, and others, **use design tokens** via the `useTheme` hook or in the sx prop function.

```tsx
<Typography sx={({ tokens }) => ({ color: tokens.semantic.color.type.muted.value })}>
  Hello, world!
</Typography>
```

You can use the MCP server to search for design tokens by path or value.

## Layouts

Use `<Container>` for setting up basic rules such as max width and alignment of the page. This is already done in the `PageLayout` component.

For layouts, prefer `<Stack>` or `<Box>` components.

### Grids

The responsive `<Grid>` component have the following column sizes available: "sm": 4, "md" & "lg": 8, "xl": 12.

Use the `GridPreset` for the page from `useTheme`.

```tsx
import {
  Container,
  GridLegacy as Grid, // Note that we use the old `GridLegacy` component from MUI which has been replaced since
  useTheme,
} from "@diligentcorp/atlas-react-bundle";

function MyLayout() {
  const { presets } = useTheme();
  return (
    <Container>
      <Grid {...presets.GridPresets.page}>
        <Grid item sm={4} md={4} lg={4} xl={6} />
      </Grid>
    </Container>
  );
}
```

## App contents

Assume that you're working on an enterprise B2B app unless otherwise specified.

The org name and logo you can set on the `AppLayout` component in `App.tsx` should represent the customer.

## Writing style

The Diligent writing style is following the Microsoft Writing Style Guide. Consult it for detailed information, but here are some important rules to follow:

**Use sentence-style capitalization.** Everything is lowercase except the first word in a sentence and proper nouns.

- ✅ Be friendly, concise, and solution-focused.
- ✅ Use "you" and "we"; use contractions; use active voice.
- ✅ Lead with the important part; keep text short and scannable.
- ✅ Make buttons and dialogs action-oriented and consistent.
- ✅ Write with accessibility and localization in mind.
- ❌ Don't blame the user.
- ❌ Don't be formal, robotic, or full of jargon.
- ❌ Don't over-explain or repeat yourself.
- ❌ Don't rely on culture-specific references or hard-to-translate constructs

## Import paths

Import paths are slightly different for the prototype environment compared to the regular development environment.

- Use `@diligentcorp/atlas-react-bundle` for **Atlas-specific components**: `AppLayout`, `AtlasThemeProvider`, `PageHeader`, `OverflowBreadcrumbs`, and other Atlas components not present in base MUI.
- Use `@mui/material` for **standard MUI building blocks**: `Box`, `Stack`, `Typography`, `Container`, `Chip`, `Button`, `Divider`, `TextField`, etc.
- For icons, use the `@diligentcorp/atlas-react-bundle/icons/[IconName]` import path.
- For global navigation, use the `@diligentcorp/atlas-react-bundle/global-nav` import path.
- For MUI-X components, use `@mui/x-data-grid`, `@mui/x-date-pickers`, etc. directly.

When in doubt, consult the Atlas MCP server to check whether a component is Atlas-specific or a standard MUI re-export.

---

## Custom attributes prototype

This is a proof-of-concept prototype for the **Custom Attributes** feature of the Object Library (ARC Core). Consult the reference documents in `src/docs/` before implementing any feature:

- `custom-attributes-product-context.md` — product context, personas, solution direction, constraints
- `custom-attributes-milestone-requirements.md` — full M0/M1/M2/M3 requirements, FRs, open questions

### Two surfaces

There are two distinct UI surfaces to design for:

1. **Schema management UI** (`features/schemaManagement/`) — admin-facing. Schema Administrators define, edit, and deprecate custom attributes. **This surface extends the M0 read-only schema viewer** — it does not replace it. When a user has `manage_schema:{object_type}` permission, write controls are layered on top of the viewer.
2. **Object detail/edit UI** (future feature) — end-user-facing. Where end users see and populate attribute values when creating or editing objects.

Both surfaces are Object Library frontend components. Host apps (Risk Manager, Internal Controls, etc.) embed them — they never build their own.

### Attribute types

The canonical 12 attribute types are defined in `src/types/attribute.ts`. Do **not** add, remove, or rename types without consulting the PRDs in `src/docs/`.

Current canonical set: `text`, `longText`, `number`, `date`, `dateTime`, `singleSelect`, `multiSelect`, `user`, `users`, `boolean`, `currency`, `attachment`.

Note: a `link` type is **not** part of the spec. URL/Email/Phone handling is an open question (M1 Q4).

### Schema viewer extensibility

`ReadOnlySchemaViewer` accepts a `canManageSchema` prop. When `true`, write controls (create, edit, deprecate) become available — this is the M1 schema management surface. In M0 this prop is always `false`.

### Permissions

Schema management is gated by `manage_schema:{object_type}`. In the prototype this is simulated via a toggle or prop rather than real authentication.
