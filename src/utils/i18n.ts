import type { AttributeType } from "../types/attribute.js";

/**
 * Minimal i18n stub for prototyping.
 * In production, replace with the platform's localization mechanism.
 * All strings use en-US. Keys are provided for future localization without
 * requiring code changes — swap the `t` implementation only.
 */
export const t = (_key: string, fallback: string): string => fallback;

export const STR = {
  required: t("attr.required", "Required"),
  deprecated: t("attr.deprecated", "Deprecated"),
  /** Attribute removed from the active schema (shown in schema admin and previews). */
  recentlyDeleted: t("attr.recentlyDeleted", "Recently deleted"),
  noValue: t("attr.noValue", "—"),
  yes: t("attr.yes", "Yes"),
  no: t("attr.no", "No"),
  more: t("attr.more", "More"),
  inactive: t("attr.inactive", "Inactive"),
  builtIn: t("attr.builtIn", "Built-in"),
  custom: t("attr.custom", "Custom"),
  active: t("attr.active", "Active"),

  schemaViewer: {
    title: t("schemaViewer.title", "Object schema"),
    subtitle: t(
      "schemaViewer.subtitle",
      "Browse the base schema for this object type, including attribute types and descriptions.",
    ),
    customAttributesHeading: t("schemaViewer.customAttributes", "Custom attributes"),
  },

  schemaManagement: {
    title: t("schemaManagement.title", "Schema management"),
    subtitle: t(
      "schemaManagement.subtitle",
      "Add and manage custom attributes to extend the base schema for this object type.",
    ),
    ootbSectionTitle: t("schemaManagement.ootbSection", "Base schema"),
    ootbSectionSubtitle: t(
      "schemaManagement.ootbSectionSubtitle",
      "Built-in attributes provided by the platform. These cannot be edited or removed.",
    ),
    customSectionTitle: t("schemaManagement.customSection", "Custom attributes"),
    customSectionSubtitle: t(
      "schemaManagement.customSectionSubtitle",
      "Attributes added by your organization to extend the base schema.",
    ),
    addAttribute: t("schemaManagement.addAttribute", "Add attribute"),
    addCustomAttribute: t("schemaManagement.addCustomAttribute", "Add custom attribute"),
    attributesSectionTitle: t("schemaManagement.attributesSectionTitle", "Attributes"),
    showingAttributesCount: (visible: number, total: number) =>
      visible === total
        ? t("schemaManagement.showingAttributesCountAll", `Showing ${total} attributes`)
        : t("schemaManagement.showingAttributesCount", `Showing ${visible} of ${total} attributes`),
    previewInHost: t("schemaManagement.previewInHost", "Preview"),
    originLabel: t("schemaManagement.originLabel", "Origin"),
    originAllLabel: t("schemaManagement.originAllLabel", "Any"),
    filterAll: t("schemaManagement.filterAll", "All"),
    filterBase: t("schemaManagement.filterBase", "System"),
    filterCustom: t("schemaManagement.filterCustom", "Custom"),
    attributeFilterLabel: t("schemaManagement.attributeFilterLabel", "Show"),
    searchAttributesLabel: t("schemaManagement.searchAttributesLabel", "Search"),
    searchAttributesPlaceholder: t(
      "schemaManagement.searchAttributesPlaceholder",
      "Search by attribute name or description",
    ),
    filterByTypeLabel: t("schemaManagement.filterByTypeLabel", "Type"),
    typeFilterAll: t("schemaManagement.typeFilterAll", "All types"),
    typeFilterSelectedCount: (count: number) =>
      t("schemaManagement.typeFilterSelectedCount", `${count} selected`),
    clearTypeFilterAria: t("schemaManagement.clearTypeFilterAria", "Clear type filter"),
    reorderAttributes: t("schemaManagement.reorderAttributes", "Reorder"),
    saveAttributeOrder: t("schemaManagement.saveAttributeOrder", "Save order"),
    reorderModeActiveHint: t(
      "schemaManagement.reorderModeActiveHint",
      "Drag custom attributes by the handle inside the dotted area; system attributes above stay locked.",
    ),
    reorderEmptyCustomSection: t(
      "schemaManagement.reorderEmptyCustomSection",
      "No custom attributes in this section for the current filters.",
    ),
    reorderEmptySectionDropHint: t(
      "schemaManagement.reorderEmptySectionDropHint",
      "Drag a custom attribute here to move it into this section.",
    ),
    lastSavedLabel: (time: string) =>
      t("schemaManagement.lastSavedLabel", `Last saved ${time}`),
    lastSavedNever: t("schemaManagement.lastSavedNever", "No changes yet"),
    attributeFilterAria: t(
      "schemaManagement.attributeFilterAria",
      "Filter attributes shown in each schema section",
    ),
    sectionEmptyForFilter: t(
      "schemaManagement.sectionEmptyForFilter",
      "Nothing matches this filter in this section.",
    ),
    emptyState: t(
      "schemaManagement.emptyState",
      "No custom attributes yet. Add your first attribute to extend the schema.",
    ),
    editAttribute: t("schemaManagement.editAttribute", "Edit"),
    editForm: t("schemaManagement.editForm", "Edit form"),
    dragHandleReorder: t("schemaManagement.dragHandleReorder", "Drag to reorder"),
    reorderModeTitle: t("schemaManagement.reorderModeTitle", "Reorder custom attributes"),
    reorderModeDescription: t(
      "schemaManagement.reorderModeDescription",
      "Drag the handle on the left to change list order. Editing and expanding rows are turned off until you finish.",
    ),
    doneReorderMode: t("schemaManagement.doneReorderMode", "Done reordering"),
    showRecentlyDeleted: (count: number) =>
      t(
        "schemaManagement.showRecentlyDeleted",
        `Show ${count} recently deleted`,
      ),
    hideRecentlyDeleted: t("schemaManagement.hideRecentlyDeleted", "Hide recently deleted"),
    deleteAttributeSheetSectionTitle: t(
      "schemaManagement.deleteAttributeSheetSectionTitle",
      "Delete attribute",
    ),
    deleteAttributeSheetWarning: t(
      "schemaManagement.deleteAttributeSheetWarning",
      "Removes this attribute from the active schema. A summary stays under Recently deleted for 30 days, then disappears. The full record is kept in change history.",
    ),
    recentlyDeletedRetentionCaption: t(
      "schemaManagement.recentlyDeletedRetentionCaption",
      "Items disappear after 30 days. Full trail in change history.",
    ),
    recentlyDeletedDeletedMeta: (when: string, actor: string) =>
      t("schemaManagement.recentlyDeletedDeletedMeta", `Deleted ${when} · ${actor}`),
    deleteAttributeSheetButton: t("schemaManagement.deleteAttributeSheetButton", "Delete attribute"),
  },

  workflowsStub: {
    title: t("workflowsStub.title", "Workflows"),
    subtitle: t(
      "workflowsStub.subtitle",
      "Placeholder until a workflows prototype runs in this shell.",
    ),
    body: t(
      "workflowsStub.body",
      "A workflows surface is not wired up in this prototype yet. Use schema management and roles & permissions to explore the current slices; linking across all three areas will come in a later increment.",
    ),
  },

  workflowManagement: {
    /** Page */
    pageTitle: t("workflowManagement.pageTitle", "Workflows"),
    pageSubtitle: t(
      "workflowManagement.pageSubtitle",
      "Define and inspect workflow templates for object types. View active instances and their current states.",
    ),
    scaffoldNotice: t(
      "workflowManagement.scaffoldNotice",
      "This is a read-only scaffold for stakeholder discussion, aligned with the Workflows Service API model. Editing templates and triggering transitions will be available in a later increment.",
    ),

    /** Template board */
    templateSectionTitle: t("workflowManagement.templateSectionTitle", "Workflow template"),
    templateMetaOrg: (orgId: number) =>
      t("workflowManagement.templateMetaOrg", `Org ${orgId}`),
    boardHint: t(
      "workflowManagement.boardHint",
      "Click a state to see its transitions, guards, and actions.",
    ),
    eventLabel: t("workflowManagement.eventLabel", "event:"),
    protectedStep: t("workflowManagement.protectedStep", "Protected step"),

    /** Detail drawer */
    closeDetailPanel: t("workflowManagement.closeDetailPanel", "Close details panel"),
    drawerDescription: t("workflowManagement.drawerDescription", "Description"),
    drawerTransitionsTo: t("workflowManagement.drawerTransitionsTo", "Transitions"),
    terminalStateNote: t(
      "workflowManagement.terminalStateNote",
      "Terminal state — no further transitions defined.",
    ),
    guardsTitle: t("workflowManagement.guardsTitle", "Guards (sync)"),
    guardTypeBadge: t("workflowManagement.guardTypeBadge", "webhook"),
    actionsTitle: t("workflowManagement.actionsTitle", "Actions (async)"),
    actionTypeBadge: t("workflowManagement.actionTypeBadge", "custom"),
    actionAsyncNote: t(
      "workflowManagement.actionAsyncNote",
      "Actions run asynchronously. The instance is locked until the consumer app sends back a completion event.",
    ),
    eventSchemaChip: t("workflowManagement.eventSchemaChip", "payload schema"),
    eventSchemaTooltip: t(
      "workflowManagement.eventSchemaTooltip",
      "This transition validates the event payload against a JSON Schema before processing guards.",
    ),
    drawerFootnote: t(
      "workflowManagement.drawerFootnote",
      "Read-only scaffold — transition configuration will be editable in the full workflow editor.",
    ),

    /** Instance table */
    instancesTitle: t("workflowManagement.instancesTitle", "Active instances"),
    instancesSubtitle: t(
      "workflowManagement.instancesSubtitle",
      "Objects currently running against this workflow template, and their current state.",
    ),
    instancesLockBanner: (count: number) =>
      t(
        "workflowManagement.instancesLockBanner",
        `${count} instance${count === 1 ? " is" : "s are"} locked — an async action is in progress. The instance will unlock when the consumer app sends back a completion event.`,
      ),
    instancesTableAriaLabel: t(
      "workflowManagement.instancesTableAriaLabel",
      "Workflow instances",
    ),
    instanceColObject: t("workflowManagement.instanceColObject", "Object"),
    instanceColType: t("workflowManagement.instanceColType", "Type"),
    instanceColState: t("workflowManagement.instanceColState", "Current state"),
    instanceColUpdated: t("workflowManagement.instanceColUpdated", "Last updated"),
    instanceLockedTooltip: t(
      "workflowManagement.instanceLockedTooltip",
      "Locked — an async action is being processed. Further state changes are blocked until the action completes.",
    ),
    instanceLockedAriaLabel: t(
      "workflowManagement.instanceLockedAriaLabel",
      "Instance locked",
    ),
    instancesFootnote: t(
      "workflowManagement.instancesFootnote",
      "Prototype only — instances are simulated. In production, each row represents a live object record linked to this workflow template.",
    ),
  },

  formPreview: {
    title: t("formPreview.title", "Form preview"),
    subtitle: t(
      "formPreview.subtitle",
      "Low-fidelity read-only layout of attributes on a record — structure only, not final host-app styling.",
    ),
    disclaimer: t(
      "formPreview.disclaimer",
      "Sample grouping only. Production layout and sectioning are owned by the host application.",
    ),
    sectionOverview: t("formPreview.sectionOverview", "Overview"),
    sectionScore: t("formPreview.sectionScore", "Score"),
    sectionAttachments: t("formPreview.sectionAttachments", "Attachments"),
    editAttributeOrder: t("formPreview.editAttributeOrder", "Edit attribute order"),
    reorderSheetTitle: t("formPreview.reorderSheetTitle", "Custom attribute order"),
    reorderSheetDescription: t(
      "formPreview.reorderSheetDescription",
      "Drag within a section to reorder custom attributes. Drag into another section to move an attribute—we will ask you to confirm. Save applies changes to this preview. Cancel closes without applying changes.",
    ),
    reorderSheetClose: t("formPreview.reorderSheetClose", "Close reorder sheet"),
    reorderSheetListAria: t("formPreview.reorderSheetListAria", "Reorder custom attributes"),
    reorderSheetSectionHeading: (sectionName: string) =>
      t("formPreview.reorderSheetSectionHeading", sectionName),
    reorderSheetEmptySectionHint: t(
      "formPreview.reorderSheetEmptySectionHint",
      "Drop a custom attribute here to move it into this section.",
    ),
    moveAttributeSectionDialogTitle: t(
      "formPreview.moveAttributeSectionDialogTitle",
      "Move attribute to another section?",
    ),
    moveAttributeSectionDialogBody: (
      attributeName: string,
      fromSectionName: string,
      toSectionName: string,
    ) =>
      t(
        "formPreview.moveAttributeSectionDialogBody",
        `You're moving ${attributeName} from the ${fromSectionName} section to the ${toSectionName} section.`,
      ),
    moveAttributeSectionConfirm: t("formPreview.moveAttributeSectionConfirm", "Move attribute"),
    formUpdatedToast: t("formPreview.formUpdatedToast", "The form preview has been updated."),
    viewInContext: t("formPreview.viewInContext", "View in context"),
  },

  formPreviewDestination: {
    prototypeBanner: t(
      "formPreviewDestination.prototypeBanner",
      "Prototype only — this screen imagines how Risk manager could host the same attribute layout on a full record page. Object Library engineering is exploring host-delivered components via API; copy, hierarchy, and surrounding modules here are for discussion, not specification.",
    ),
    shellTitle: t("formPreviewDestination.shellTitle", "Context preview"),
    backAria: t("formPreviewDestination.backAria", "Back to edit form preview"),
    breadcrumbRiskManager: t("formPreviewDestination.breadcrumbRiskManager", "Risk manager"),
    breadcrumbRegister: t("formPreviewDestination.breadcrumbRegister", "Enterprise risks"),
    breadcrumbRecord: t("formPreviewDestination.breadcrumbRecord", "R-2841 · Third-party concentration"),
    pageTitle: t(
      "formPreviewDestination.pageTitle",
      "Third-party concentration — cloud infrastructure",
    ),
    pageSubtitle: t(
      "formPreviewDestination.pageSubtitle",
      "Record identity and ownership. Values here typically come from the register and sync to downstream reports.",
    ),
    metaObjectType: t("formPreviewDestination.metaObjectType", "Enterprise risk"),
    metaRiskId: t("formPreviewDestination.metaRiskId", "ER-2841"),
    metaBusinessUnit: t("formPreviewDestination.metaBusinessUnit", "Business unit:"),
    metaBusinessUnitValue: t("formPreviewDestination.metaBusinessUnitValue", "North America operations"),
    metaRiskOwner: t("formPreviewDestination.metaRiskOwner", "Risk owner:"),
    metaRiskOwnerValue: t("formPreviewDestination.metaRiskOwnerValue", "Samira Okafor"),
    statusInReview: t("formPreviewDestination.statusInReview", "In review"),
    savedIndicator: t("formPreviewDestination.savedIndicator", "Saved"),
    savedTooltip: t("formPreviewDestination.savedTooltip", "Last saved 12 min ago by Jordan Lee"),
    workflowMoveButton: t("formPreviewDestination.workflowMoveButton", "Move to"),
    workflowNextStatus: t("formPreviewDestination.workflowNextStatus", "Done"),
    viewModeLabel: t("formPreviewDestination.viewModeLabel", "View:"),
    viewModeMenuAll: t("formPreviewDestination.viewModeMenuAll", "All fields"),
    viewModeMenuHideDeprecated: t("formPreviewDestination.viewModeMenuHideDeprecated", "Hide deprecated"),
    viewModeMenuDeprecatedOnly: t(
      "formPreviewDestination.viewModeMenuDeprecatedOnly",
      "Show deprecated only",
    ),
    viewModeFilterHint: t(
      "formPreviewDestination.viewModeFilterHint",
      "No fields match this filter.",
    ),
    sectionNoFields: t("formPreviewDestination.sectionNoFields", "No fields in this section."),
    deprecatedDropZoneMessage: t(
      "formPreviewDestination.deprecatedDropZoneMessage",
      "This field was removed from the active schema.",
    ),
    hostFormUserPlaceholder: t("formPreviewDestination.hostFormUserPlaceholder", "Search or select a user"),
    hostFormUsersPlaceholder: t("formPreviewDestination.hostFormUsersPlaceholder", "Add people"),
    hostFormDropZoneDragPrefix: t("formPreviewDestination.hostFormDropZoneDragPrefix", "Drag files here or"),
    hostFormDropZoneLink: t("formPreviewDestination.hostFormDropZoneLink", "select files to upload"),
    hostFormDropZoneFormats: t("formPreviewDestination.hostFormDropZoneFormats", "Formats: JPG, PDF, XLS"),
    hostFormDropZoneMaxSize: t("formPreviewDestination.hostFormDropZoneMaxSize", "Max. file size: 5 MB"),
    hostFormDropZoneAria: t(
      "formPreviewDestination.hostFormDropZoneAria",
      "File upload: drop files here or use the link to choose files",
    ),
    hostFormRemoveFileAria: (fileName: string) =>
      t("formPreviewDestination.hostFormRemoveFileAria", `Remove ${fileName}`),
  },

  form: {
    addTitle: t("form.addTitle", "Add attribute"),
    editTitle: t("form.editTitle", "Edit attribute"),
    chooseType: t("form.chooseType", "Choose a type"),
    chooseTypeHint: t("form.chooseTypeHint", "The type determines what kind of value users can enter. It cannot be changed after saving."),
    changeType: t("form.changeType", "Change type"),
    nameLabel: t("form.nameLabel", "Name"),
    nameHint: t("form.nameHint", "Visible to all users on object records."),
    descriptionLabel: t("form.descriptionLabel", "Description"),
    descriptionHint: t(
      "form.descriptionHint",
      "Explain what this attribute captures, when to use it, and example values. This description is shown to users and consumed by AI assistants.",
    ),
    optionsLabel: t("form.optionsLabel", "Options"),
    addOptionLabel: t("form.addOptionLabel", "Add option"),
    addOptionPlaceholder: t("form.addOptionPlaceholder", "Option label"),
    noOptionsYet: t("form.noOptionsYet", "No options added yet."),
    currencyCodeLabel: t("form.currencyCodeLabel", "Currency code"),
    currencyCodeHint: t("form.currencyCodeHint", "ISO 4217 code applied to all values, e.g. USD, EUR, GBP."),
    currencyModeLabel: t("form.currencyModeLabel", "Currency mode"),
    currencyModePerAttribute: t("form.currencyModePerAttribute", "Fixed — same currency for all values"),
    currencyModePerValue: t("form.currencyModePerValue", "Per record — each value can have a different currency"),
    attachmentModeLabel: t("form.attachmentModeLabel", "Upload mode"),
    attachmentModeSingle: t("form.attachmentModeSingle", "Single file"),
    attachmentModeMultiple: t("form.attachmentModeMultiple", "Multiple files"),
    allowGroupsLabel: t("form.allowGroupsLabel", "Allow group selection"),
    allowGroupsHint: t("form.allowGroupsHint", "Lets users select a group in addition to individual users."),
    sectionLabel: t("form.sectionLabel", "Section"),
    sectionHint: t("form.sectionHint", "The section of the object where this attribute will appear. Defaults to Overview."),
    save: t("form.save", "Save attribute"),
    cancel: t("form.cancel", "Cancel"),
    saving: t("form.saving", "Saving…"),
  },

  schemaManagementBos: {
    title: t("schemaManagementBos.title", "Schema management (BOS-constrained)"),
    subtitle: t(
      "schemaManagementBos.subtitle",
      "Add and manage custom attributes using the field types available in the current BOS configuration. Additional types will be enabled in Q2.",
    ),
    bannerTitle: t("schemaManagementBos.bannerTitle", "BOS v1 field types"),
    bannerBody: t(
      "schemaManagementBos.bannerBody",
      "This view reflects the limited set of attribute types available in the initial BOS integration. Types like currency, attachment, users, and contact fields will be unlocked starting in Q2.",
    ),
  },

  schemaManagementBosV2: {
    title: t("schemaManagementBosV2.title", "Schema management (BOS v2)"),
    subtitle: t(
      "schemaManagementBosV2.subtitle",
      "Exploration view: the Risk schema annotated with current BOS export scope, system fields, and relationship counts. For stakeholder review — not yet in production.",
    ),
    bannerTitle: t("schemaManagementBosV2.bannerTitle", "Exploration — for stakeholder review"),
    bannerBody: t(
      "schemaManagementBosV2.bannerBody",
      "This view models the full BOS Risk schema, including system fields and relationship counts. It also corrects three gaps vs. the current schema: workflow status is now surfaced as a built-in attribute, Information Security is added to risk category options, and risk owner is updated to support multiple owners. Custom attributes are constrained to BOS-supported types.",
    ),
  },

  aiDescription: {
    generateButton: t("ai.descriptionGenerate", "Suggest with AI"),
    generatingLabel: t("ai.descriptionGenerating", "Generating suggestion…"),
    generatedDisclaimer: t("ai.descriptionDisclaimer", "AI-suggested content — review before saving"),
    errorMessage: t("ai.descriptionError", "Couldn't generate a suggestion. Try again."),
    refineButton: t("ai.descriptionRefine", "Refine with AI"),
  },

  descriptionQuality: {
    label: t("quality.label", "Description quality"),
    poor: t("quality.poor", "Needs improvement"),
    fair: t("quality.fair", "Fair"),
    good: t("quality.good", "Good"),
    tooltipTitle: t("quality.tooltipTitle", "Quality criteria"),
  },

  overlap: {
    warningTitle: t("overlap.warningTitle", "Similar attribute exists"),
    warningBody: t(
      "overlap.warningBody",
      "An attribute with a similar name already exists: \"{name}\". Check whether a new attribute is needed or if the existing one can be reused.",
    ),
  },

  attributeDeletionDialog: {
    title: t("attributeDeletion.title", "Delete this attribute?"),
    subtitle: t(
      "attributeDeletion.subtitle",
      "The attribute will stop appearing on new and edited records. Existing values stay on records for audit, but you can't turn this attribute back on.",
    ),
    permanenceNote: t(
      "attributeDeletion.permanenceNote",
      "This action is permanent for the schema — the attribute will not come back.",
    ),
    changeHistoryHint: t(
      "attributeDeletion.changeHistoryHint",
      "Recently deleted shows a summary for 30 days after deletion, then disappears. Open change history for the full trail.",
    ),
    reasonLabel: t("attributeDeletion.reasonLabel", "Reason (optional)"),
    reasonHint: t(
      "attributeDeletion.reasonHint",
      "Stored in change history only (not shown in the Recently deleted list). Example: 'Replaced by Regulatory classification'.",
    ),
    confirm: t("attributeDeletion.confirm", "Delete attribute"),
    cancel: t("attributeDeletion.cancel", "Cancel"),
  },

  toasts: {
    attributeAdded: t("toast.added", "Attribute added successfully."),
    attributeUpdated: t("toast.updated", "Attribute updated successfully."),
    attributeDeleted: t("toast.attributeDeleted", "Attribute deleted."),
    validationError: t("toast.validationError", "Please fill in all required fields."),
  },

  roleAccess: {
    homeTitle: t("roleAccess.homeTitle", "Roles & permissions"),
    homeSubtitle: t(
      "roleAccess.homeSubtitle",
      "Roles and permissions are centrally managed here for some applications. For others, you can manage them directly within the application by selecting the button beside the app name.",
    ),
    assetInventorySectionTitle: t(
      "roleAccess.assetInventorySectionTitle",
      "Asset Inventory and Asset Manager",
    ),
    assetInventoryManagedBody: t(
      "roleAccess.assetInventoryManagedBody",
      "These roles must be managed directly in the application.",
    ),
    manageInUsers: t("roleAccess.manageInUsers", "Manage in Users"),
    learnMore: t("roleAccess.learnMore", "Learn more"),
    addRole: t("roleAccess.addRole", "Add role"),
    addRoleMenuOptionsHeader: t(
      "roleAccess.addRoleMenuOptionsHeader",
      "Create new role from existing",
    ),
    chipOotb: t("roleAccess.chipOotb", "OOTB"),
    chipCustom: t("roleAccess.chipCustom", "Custom"),
    chipDerivedCount: (n: number) => t("roleAccess.chipDerivedCount", `${n} roles based on this`),
    chipBasedOn: (name: string) => t("roleAccess.chipBasedOn", `based on: ${name}`),
    breadcrumbsLabel: t("roleAccess.breadcrumbsLabel", "Breadcrumb"),
    crumbHome: t("roleAccess.crumbHome", "Home"),
    /** First breadcrumb on role edit — navigates to schema management (same as Home). */
    crumbViewSchema: t("roleAccess.crumbViewSchema", "View schema"),
    crumbRoles: t("roleAccess.crumbRoles", "Roles & permissions"),
    backToRoles: t("roleAccess.backToRoles", "Back to roles"),
    /** Appended to the source role name when duplicating (e.g. "Risk Viewer (copy)"). */
    roleDuplicateNameSuffix: t("roleAccess.roleDuplicateNameSuffix", " (copy)"),
    editTitlePrefix: t("roleAccess.editTitlePrefix", "Edit: "),
    savedStatus: t("roleAccess.savedStatus", "Saved"),
    done: t("roleAccess.done", "Done"),
    metaApplication: t("roleAccess.metaApplication", "Application"),
    metaLicense: t("roleAccess.metaLicense", "Required license"),
    metaBasedOn: t("roleAccess.metaBasedOn", "Based on"),
    metaCapabilities: t("roleAccess.metaCapabilities", "Capabilities"),
    metaCapabilitiesCanChangeObjectState: t(
      "roleAccess.metaCapabilitiesCanChangeObjectState",
      "Can change object state",
    ),
    metaCapabilitiesFootnote: t(
      "roleAccess.metaCapabilitiesFootnote",
      "Set by your implementation or app team — not editable in this view for now.",
    ),
    metaCapabilitiesInfoAria: t(
      "roleAccess.metaCapabilitiesInfoAria",
      "Why capabilities are not editable here",
    ),
    roleDetailsTitle: t("roleAccess.roleDetailsTitle", "Role details"),
    roleNameLabel: t("roleAccess.roleNameLabel", "Role name"),
    roleNameHint: t("roleAccess.roleNameHint", "Use minimum of 3 characters and maximum of 25 characters."),
    roleDescriptionLabel: t("roleAccess.roleDescriptionLabel", "Description"),
    rulesTitle: t("roleAccess.rulesTitle", "Rules"),
    addRule: t("roleAccess.addRule", "Add rule"),
    editRule: t("roleAccess.editRule", "Edit"),
    summaryActions: t("roleAccess.summaryActions", "Actions"),
    summaryConditions: t("roleAccess.summaryConditions", "Conditions"),
    summaryPermissions: t("roleAccess.summaryPermissions", "Permissions"),
    conditionChipIs: (field: string, value: string) => t("roleAccess.conditionChipIs", `${field} is ${value}`),
    ruleSummaryNoActions: t("roleAccess.ruleSummaryNoActions", "No actions allowed"),
    ruleSummaryNoConditions: t("roleAccess.ruleSummaryNoConditions", "No conditions"),
    canReadAllSections: (n: number) => t("roleAccess.canReadAllSections", `Can read all ${n} sections`),
    canReadSomeSections: (read: number, total: number) =>
      t("roleAccess.canReadSomeSections", `Can read ${read} of ${total} sections`),
    canEditSections: (n: number) => t("roleAccess.canEditSections", `Can edit ${n} sections`),
    canReadAllAttributes: (n: number) => t("roleAccess.canReadAllAttributes", `Can read all ${n} attributes`),
    canReadSomeAttributes: (read: number, total: number) =>
      t("roleAccess.canReadSomeAttributes", `Can read ${read} of ${total} attributes`),
    canEditAttributes: (n: number) => t("roleAccess.canEditAttributes", `Can edit ${n} attributes`),
    objectLabel: t("roleAccess.objectLabel", "Object"),
    objectRisk: t("roleAccess.objectRisk", "Risk"),
    objectControl: t("roleAccess.objectControl", "Control"),
    cancel: t("roleAccess.cancel", "Cancel"),
    save: t("roleAccess.save", "Save"),
    whenConditionsTitle: t("roleAccess.whenConditionsTitle", "When these conditions are true"),
    whenConditionsHint: t(
      "roleAccess.whenConditionsHint",
      "Validation is requested from certain applications when saving this role.",
    ),
    addCondition: t("roleAccess.addCondition", "Add condition"),
    conditionAnd: t("roleAccess.conditionAnd", "AND"),
    conditionColField: t("roleAccess.conditionColField", "Field"),
    conditionColFieldName: t("roleAccess.conditionColFieldName", "Field name"),
    conditionColOperator: t("roleAccess.conditionColOperator", "Operator"),
    conditionColValue: t("roleAccess.conditionColValue", "Value"),
    conditionFieldStatus: t("roleAccess.conditionFieldStatus", "Status"),
    conditionFieldAttribute: t("roleAccess.conditionFieldAttribute", "Attribute"),
    conditionFieldNameImpact: t("roleAccess.conditionFieldNameImpact", "Impact"),
    conditionOpIs: t("roleAccess.conditionOpIs", "Is"),
    conditionValueInProgress: t("roleAccess.conditionValueInProgress", "In progress"),
    conditionValueModerate: t("roleAccess.conditionValueModerate", "Moderate"),
    removeCondition: t("roleAccess.removeCondition", "Remove condition"),
    allowActionsTitle: t("roleAccess.allowActionsTitle", "Allow these actions"),
    actionListView: t("roleAccess.actionListView", "Can view the object in a list view"),
    actionNextStatus: t("roleAccess.actionNextStatus", "Can move object to next status"),
    allowPermissionsTitle: t("roleAccess.allowPermissionsTitle", "Allow these permissions"),
    customToggle: t("roleAccess.customToggle", "Custom"),
    levelNone: t("roleAccess.levelNone", "None"),
    levelView: t("roleAccess.levelView", "View"),
    levelEdit: t("roleAccess.levelEdit", "Edit"),
    sectionCustomSummary: (noneCount: number, viewCount: number, editCount: number) =>
      t(
        "roleAccess.sectionCustomSummary",
        `Custom (${noneCount} None, ${viewCount} View, ${editCount} Edit)`,
      ),
    permissionGroupModeAnnounce: (sectionTitle: string, levelLabel: string) =>
      t(
        "roleAccess.permissionGroupModeAnnounce",
        `${sectionTitle}: ${levelLabel} applied to all attributes in this section.`,
      ),
    permissionCustomModeAnnounce: (sectionTitle: string) =>
      t(
        "roleAccess.permissionCustomModeAnnounce",
        `${sectionTitle}: Custom mode. Set each attribute below.`,
      ),
    permissionAutoUniformAnnounce: (sectionTitle: string, levelLabel: string) =>
      t(
        "roleAccess.permissionAutoUniformAnnounce",
        `${sectionTitle}: All attributes match. ${levelLabel} mode selected.`,
      ),
    permissionCustomOffUniformAnnounce: (sectionTitle: string, levelLabel: string) =>
      t(
        "roleAccess.permissionCustomOffUniformAnnounce",
        `${sectionTitle}: Custom turned off. ${levelLabel} mode selected.`,
      ),
    permissionCustomOffMixedAnnounce: (sectionTitle: string, levelLabel: string) =>
      t(
        "roleAccess.permissionCustomOffMixedAnnounce",
        `${sectionTitle}: ${levelLabel} applied to all attributes.`,
      ),
    permissionExpandHintGroupMode: t(
      "roleAccess.permissionExpandHintGroupMode",
      "Turn on Custom to set permissions for each attribute separately.",
    ),
    creatingDuplicateRole: t(
      "roleAccess.creatingDuplicateRole",
      "Saving a copy of this role…",
    ),
    duplicateMissingSource: t(
      "roleAccess.duplicateMissingSource",
      "To create a duplicate, use Add role and pick an existing role, or open a role from the list.",
    ),
    prototypeNoEditor: t(
      "roleAccess.prototypeNoEditor",
      "That role is not in the catalog for this prototype.",
    ),
    openSampleRole: t("roleAccess.openSampleRole", "Open sample custom role"),
    searchPlaceholder: t("roleAccess.searchPlaceholder", "Search by product or role name"),
    exportButton: t("roleAccess.exportButton", "Export"),
    exportTooltip: t(
      "roleAccess.exportTooltip",
      "Can download the list of all roles per applications and assignments in total.",
    ),
    searchNoResults: t("roleAccess.searchNoResults", "No products or roles match your search."),
  },

  workflowEditor: {
    /** Page */
    pageTitle: t("workflowEditor.pageTitle", "Workflow template editor"),
    newTemplatePageTitle: t("workflowEditor.newTemplatePageTitle", "New workflow template"),
    pageSubtitle: t(
      "workflowEditor.pageSubtitle",
      "Define states and transitions for a workflow template. Click a state or connection to configure it.",
    ),
    scaffoldNotice: t(
      "workflowEditor.scaffoldNotice",
      "This is a prototype editor. Changes are local only — saving to the Workflows Service API will be available in a later increment.",
    ),

    /** Template meta */
    templateNameLabel: t("workflowEditor.templateNameLabel", "Template name"),
    templateNameHint: t("workflowEditor.templateNameHint", "Unique per version and service (e.g. 'Risk lifecycle')."),
    templateVersionLabel: t("workflowEditor.templateVersionLabel", "Version"),
    templateServiceLabel: t("workflowEditor.templateServiceLabel", "Service"),
    templateServiceHint: t("workflowEditor.templateServiceHint", "Name of the consumer service that owns this template (e.g. 'risk-manager')."),
    templateMetaSectionTitle: t("workflowEditor.templateMetaSectionTitle", "Template details"),

    /** Canvas */
    initialStateBadge: t("workflowEditor.initialStateBadge", "Initial"),
    emptyStatePlaceholder: t("workflowEditor.emptyStatePlaceholder", "Click to configure…"),
    emptyStateAriaLabel: t("workflowEditor.emptyStateAriaLabel", "Unconfigured state — click to edit"),
    stateNodeAriaLabel: t("workflowEditor.stateNodeAriaLabel", "State"),
    connectionEmptyLabel: t("workflowEditor.connectionEmptyLabel", "add trigger"),
    connectionEmptyTooltip: t("workflowEditor.connectionEmptyTooltip", "No trigger defined — click to add an event name"),
    connectionClickTooltip: t("workflowEditor.connectionClickTooltip", "Click to edit this transition trigger"),
    connectionEmptyAriaLabel: t("workflowEditor.connectionEmptyAriaLabel", "Transition without trigger — click to configure"),
    connectionAriaLabel: t("workflowEditor.connectionAriaLabel", "Transition"),
    addNextStageTooltip: t("workflowEditor.addNextStageTooltip", "Add next lifecycle stage"),
    addNextStageAriaLabel: t("workflowEditor.addNextStageAriaLabel", "Add next stage"),
    emptyCanvasMessage: t(
      "workflowEditor.emptyCanvasMessage",
      "No states yet. Start by adding your first lifecycle stage.",
    ),
    emptyCanvasAction: t("workflowEditor.emptyCanvasAction", "Add first stage"),
    canvasHint: t(
      "workflowEditor.canvasHint",
      "Click a state node to edit it. Click a trigger chip between nodes to configure the transition.",
    ),

    /** State sheet */
    stateSheetNewTitle: t("workflowEditor.stateSheetNewTitle", "New state"),
    stateSheetEditTitle: (name: string) => t("workflowEditor.stateSheetEditTitle", `Edit: ${name}`),
    stateSheetCloseAria: t("workflowEditor.stateSheetCloseAria", "Close state editor"),
    stateNameLabel: t("workflowEditor.stateNameLabel", "State name"),
    stateNameHint: t(
      "workflowEditor.stateNameHint",
      "Use lowercase with underscores (e.g. in_review). This becomes the FSM state key.",
    ),
    stateDescriptionLabel: t("workflowEditor.stateDescriptionLabel", "Description"),
    stateDescriptionHint: t(
      "workflowEditor.stateDescriptionHint",
      "Describe what this state means for the object (shown in the overview board).",
    ),
    /** State color picker */
    stateColorLabel: t("workflowEditor.stateColorLabel", "Status color"),
    stateColorHint: t("workflowEditor.stateColorHint", "Shown as the card background in the workflow overview board."),
    colorOptionLabel: (color: string) => {
      const labels: Record<string, string> = {
        subtle: t("workflowEditor.colorSubtle", "Neutral"),
        information: t("workflowEditor.colorInformation", "Info"),
        warning: t("workflowEditor.colorWarning", "Warning"),
        success: t("workflowEditor.colorSuccess", "Success"),
        error: t("workflowEditor.colorError", "Error"),
        generic: t("workflowEditor.colorGeneric", "Custom"),
      };
      return labels[color] ?? color;
    },

    addNextStageSectionTitle: t("workflowEditor.addNextStageSectionTitle", "Next stage"),
    addNextStageSectionHint: t(
      "workflowEditor.addNextStageSectionHint",
      "This is a terminal state. Add a next stage to extend the workflow with another step.",
    ),
    addNextStageButton: t("workflowEditor.addNextStageButton", "Add next stage"),
    saveState: t("workflowEditor.saveState", "Save state"),
    cancel: t("workflowEditor.cancel", "Cancel"),
    unnamedState: t("workflowEditor.unnamedState", "Unnamed state"),

    /** Transition sheet */
    transitionSheetTitle: t("workflowEditor.transitionSheetTitle", "Edit transition"),
    transitionSheetSubtitle: (source: string, target: string) =>
      t("workflowEditor.transitionSheetSubtitle", `${source} → ${target}`),
    transitionSheetCloseAria: t("workflowEditor.transitionSheetCloseAria", "Close transition editor"),
    eventNameLabel: t("workflowEditor.eventNameLabel", "Event name (trigger)"),
    eventNameHint: t(
      "workflowEditor.eventNameHint",
      "Use lowercase with underscores (e.g. submit_for_review). This is the trigger that fires the transition.",
    ),
    guardsSectionHint: t(
      "workflowEditor.guardsSectionHint",
      "Sync webhooks called before the transition completes. All guards must pass.",
    ),
    addGuardButton: t("workflowEditor.addGuardButton", "Add guard"),
    noGuardsPlaceholder: t("workflowEditor.noGuardsPlaceholder", "No guards — transition fires without validation."),
    guardNameLabel: t("workflowEditor.guardNameLabel", "Guard name"),
    guardUrlLabel: t("workflowEditor.guardUrlLabel", "Webhook URL"),
    removeGuardAria: (name: string) => t("workflowEditor.removeGuardAria", `Remove guard: ${name}`),
    actionsSectionHint: t(
      "workflowEditor.actionsSectionHint",
      "Async handlers triggered after the transition is accepted. The instance locks until they complete.",
    ),
    addActionButton: t("workflowEditor.addActionButton", "Add action"),
    noActionsPlaceholder: t("workflowEditor.noActionsPlaceholder", "No actions — transition completes synchronously."),
    actionNameLabel: t("workflowEditor.actionNameLabel", "Action name"),
    removeActionAria: (name: string) => t("workflowEditor.removeActionAria", `Remove action: ${name}`),
    saveTransition: t("workflowEditor.saveTransition", "Save transition"),

    /** Remove state + undo toast */
    removeStateButton: t("workflowEditor.removeStateButton", "Remove state"),
    stateRemovedToast: (name: string) =>
      t("workflowEditor.stateRemovedToast", name.trim() ? `State "${name}" removed` : "State removed"),
    undoButton: t("workflowEditor.undoButton", "Undo"),
    closeToastButton: t("workflowEditor.closeToastButton", "Close"),
    removeStateWarning: t(
      "workflowEditor.removeStateWarning",
      "Removing this state also deletes all transitions that target it from other states.",
    ),
    removeInitialStateDisabledHint: t(
      "workflowEditor.removeInitialStateDisabledHint",
      "The initial state cannot be removed while other states exist. Change the order first.",
    ),

    /** Canvas view toggle */
    canvasViewLinear: t("workflowEditor.canvasViewLinear", "Linear"),
    canvasViewGraph: t("workflowEditor.canvasViewGraph", "Graph"),
    canvasViewToggleAria: t("workflowEditor.canvasViewToggleAria", "Switch canvas view"),
    graphCanvasHint: t(
      "workflowEditor.graphCanvasHint",
      "Drag nodes to rearrange. Draw a connection from one state to another to add a transition. Delete an edge to remove a transition.",
    ),

    /** Transition target selector */
    transitionTargetLabel: t("workflowEditor.transitionTargetLabel", "Target state"),
    transitionTargetHint: t(
      "workflowEditor.transitionTargetHint",
      "The state this transition moves the workflow instance to.",
    ),

    /** Entry point buttons on /workflows */
    editTemplateButton: t("workflowEditor.editTemplateButton", "Edit template"),
    newTemplateButton: t("workflowEditor.newTemplateButton", "New template"),
    editorEntryTitle: t("workflowEditor.editorEntryTitle", "Template editor"),
    editorEntryHint: t(
      "workflowEditor.editorEntryHint",
      "Open the template editor to define states, transitions, guards, and actions.",
    ),
  },

  auditLog: {
    globalTitle: t("auditLog.globalTitle", "Change history"),
    perAttributeTitle: t("auditLog.perAttributeTitle", "Change history"),
    auditLogButton: t("auditLog.auditLogButton", "Change history"),
    changesButton: t("auditLog.changesButton", "Change history"),
    viewHistory: t("auditLog.viewHistory", "View change history"),
    viewFullLog: t("auditLog.viewFullLog", "View full change history"),
    emptyState: t("auditLog.emptyState", "No changes recorded yet."),
    /**
     * "Last modified by Schema Administrator · 2h ago"
     * Used as a link in the edit side sheet header.
     */
    lastModifiedBy: (actor: string, when: string) =>
      `Last modified by ${actor} · ${when}`,
  },

  activityLogs: {
    /** Button label on the Roles & permissions page only. */
    button: t("activityLogs.button", "See activity logs"),
    sheetTitle: t("activityLogs.sheetTitle", "Activity logs"),
    close: t("activityLogs.close", "Close activity logs"),
    stepsTitle: t("activityLogs.stepsTitle", "Steps"),
    step1: t("activityLogs.step1", "Select dates (up to 31 days)"),
    step2: t("activityLogs.step2", "Generate activity log"),
    step3: t("activityLogs.step3", "Get an email with a link to a CSV file (expires in 30 minutes)"),
    generateButton: t("activityLogs.generateButton", "Generate activity logs"),
    dateRangeHelperText: t("activityLogs.dateRangeHelperText", "MM/DD/YYYY – MM/DD/YYYY"),
    generating: t("activityLogs.generating", "Sending request…"),
    successToast: t("activityLogs.successToast", "Your activity log is being generated. We'll email you the download link shortly."),
  },
};

/**
 * Human-readable labels for each attribute type.
 * Used in the schema viewer and schema management UI.
 */
export const TYPE_LABELS: Record<AttributeType, string> = {
  text: t("type.text", "Short text"),
  longText: t("type.longText", "Long text"),
  number: t("type.number", "Number"),
  date: t("type.date", "Date"),
  dateTime: t("type.dateTime", "Date & time"),
  singleSelect: t("type.singleSelect", "Single select"),
  multiSelect: t("type.multiSelect", "Multi-select"),
  user: t("type.user", "User"),
  users: t("type.users", "Users"),
  boolean: t("type.boolean", "Boolean"),
  currency: t("type.currency", "Currency"),
  attachment: t("type.attachment", "Attachment"),
  url: t("type.url", "URL"),
  email: t("type.email", "Email"),
  phone: t("type.phone", "Phone"),
};
