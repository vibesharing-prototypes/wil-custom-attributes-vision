/**
 * M1: Schema Management
 *
 * This feature enables Schema Administrators to create, edit, and delete
 * custom attributes on any object type they have manage_schema:{object_type} permission for.
 *
 * The schema management UI extends the M0 ReadOnlySchemaViewer component — it does not
 * introduce a separate entry point. Write controls are layered on top when
 * canManageSchema=true is passed to ReadOnlySchemaViewer.
 *
 * Implementation scope (M1 FR-1 through FR-17):
 * - Attribute creation form for all 12 types (FR-2)
 * - Mandatory description field with quality coaching (FR-3)
 * - Required/optional toggle (FR-4)
 * - Select option management: add, reorder, remove options (FR-7)
 * - Soft delete / removal from active schema with confirmation (FR-8, FR-9; prototype omits impact count)
 * - Audit logging (FR-11) — backend concern, prototype shows UI only
 * - Permission-aware rendering via manage_schema:{object_type} (FR-12)
 * - Recently deleted attribute visual treatment in management list (FR-15)
 * - AI-assisted description suggestion (FR-16, should-have)
 *
 * See src/docs/custom-attributes-milestone-requirements.md for full M1 requirements.
 */

export {};
