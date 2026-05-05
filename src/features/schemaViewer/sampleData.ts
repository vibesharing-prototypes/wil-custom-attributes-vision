import type { AttributeDefinition, ObjectSchema } from "../../types/attribute.js";
import type { AuditLogEntry } from "../schemaManagement/types.js";

/**
 * Risk Object Schema — aligned with the ERM Baseline Configuration.
 *
 * Sources:
 *   - ERM Baseline Configuration (last updated Jan 28, 2026)
 *   - ERM Baseline Configuration Updates H2/2025 (last updated Feb 13, 2026)
 *
 * Sections:
 *   Overview (5 attributes) → Score (4 attributes) → Attachments (1 attribute)
 *
 * Attributes marked ⚠️ in the spec (IRS Quantitative, RRS Quantitative, Supported files)
 * are excluded — they are not documented in the baseline config.
 *
 * Display name renames listed in the spec (e.g. "Risk description" → "Description") are
 * noted in semanticDescription but not yet applied — rename is a planned update.
 */
export const riskSchema: ObjectSchema = {
  objectType: "risk",
  objectName: "Risk",
  objectDescription:
    "A potential event or condition that could negatively affect organizational objectives. Risks are assessed, scored, owned, and linked to controls, mitigation plans, and processes across the GRC suite. Managed by the Risk Manager and Risk Essentials toolkits.",
  sections: [
    {
      id: "overview",
      name: "Overview",
      attributeIds: ["name", "risk_description", "risk_category", "risk_id", "risk_owner"],
      isOotb: true,
    },
    {
      id: "score",
      name: "Score",
      attributeIds: ["risk_impact", "likelihood", "inherent_risk_score", "residual_risk_score"],
      isOotb: true,
    },
    {
      id: "mitigation",
      name: "Mitigation",
      attributeIds: ["treatment_type", "mitigation_plan", "mitigation_target_date", "mitigation_status", "response_owner"],
      isOotb: true,
    },
    {
      id: "attachments",
      name: "Attachments",
      attributeIds: ["risk_attachment"],
      isOotb: true,
    },
  ],
  attributes: [
    // ── Overview ──────────────────────────────────────────────────────────────
    {
      id: "name",
      name: "Name",
      type: "text",
      isOotb: true,
      semanticDescription:
        "The title of this risk record. Should be concise and specific enough to distinguish the risk within a portfolio (e.g. 'Third-party vendor data breach'). Required before the record can be moved out of Draft status.",
    },
    {
      id: "risk_description",
      name: "Risk description",
      type: "longText",
      isOotb: true,
      semanticDescription:
        "Plain-language summary of the risk, its drivers, and potential impact on the organization. Planned display rename: 'Description'. Should be specific enough for a non-specialist to understand the exposure without prior context.",
    },
    {
      id: "risk_category",
      name: "Risk category",
      type: "singleSelect",
      isOotb: true,
      options: [
        { id: "brand_reputation", label: "Brand & Reputation Relevance & Execution" },
        { id: "operational", label: "Operational" },
        { id: "it_infosec", label: "IT/Infosec" },
        { id: "financial", label: "Financial" },
        { id: "regulatory_compliance", label: "Regulatory/Compliance" },
        { id: "growth", label: "Growth" },
        { id: "human_resource", label: "Human Resource" },
        { id: "legislative_regulatory", label: "Legislative and Regulatory" },
        { id: "market_expansion", label: "Market Expansion" },
        { id: "acquisition", label: "Acquisition" },
        { id: "artificial_intelligence", label: "Artificial Intelligence" },
        { id: "business_continuity", label: "Business Continuity" },
        { id: "business_industry", label: "Business and Industry" },
        { id: "company_culture", label: "Company Culture" },
        { id: "competitor", label: "Competitor" },
        { id: "customer_retention", label: "Customer Retention" },
        { id: "economic", label: "Economic" },
        { id: "fraud", label: "Fraud" },
        { id: "process_efficiency", label: "Process or Operational Efficiency" },
        { id: "third_party", label: "Third Party" },
      ],
      semanticDescription:
        "Primary classification used for portfolio-level reporting and ownership routing. Planned display rename: 'Category'. Choose the category that best represents the nature of the risk.",
    },
    {
      id: "risk_id",
      name: "Risk ID",
      type: "text",
      isOotb: true,
      semanticDescription:
        "Unique identifier for this risk record. Used for cross-referencing in reports, audits, and control mappings (e.g. 'RISK-2024-001'). Typically system-generated or assigned by the risk team.",
    },
    {
      id: "risk_owner",
      name: "Risk owner",
      type: "user",
      isOotb: true,
      semanticDescription:
        "Accountable individual responsible for monitoring and responding to this risk. Planned display rename: 'Owner'. Must have authority to approve mitigation actions. Typically a senior manager or department head.",
    },

    // ── Score ─────────────────────────────────────────────────────────────────
    {
      id: "risk_impact",
      name: "Impact",
      type: "singleSelect",
      isOotb: true,
      options: [
        { id: "very_low", label: "Very low" },
        { id: "low", label: "Low" },
        { id: "medium", label: "Medium" },
        { id: "high", label: "High" },
        { id: "very_high", label: "Very high" },
      ],
      semanticDescription:
        "Severity of the consequences if this risk materializes, assessed before controls are applied. Planned display rename: 'Impact (inherent)'. Used together with Likelihood to derive the Inherent Risk Score.",
    },
    {
      id: "likelihood",
      name: "Likelihood",
      type: "singleSelect",
      isOotb: true,
      options: [
        { id: "very_low", label: "Very low" },
        { id: "low", label: "Low" },
        { id: "medium", label: "Medium" },
        { id: "high", label: "High" },
        { id: "very_high", label: "Very high" },
      ],
      semanticDescription:
        "Probability that this risk will occur, assessed before controls are applied. Planned display rename: 'Likelihood (inherent)'. Used together with Impact to derive the Inherent Risk Score.",
    },
    {
      id: "inherent_risk_score",
      name: "Inherent risk score",
      type: "singleSelect",
      isOotb: true,
      options: [
        { id: "very_low", label: "Very low" },
        { id: "low", label: "Low" },
        { id: "medium", label: "Medium" },
        { id: "high", label: "High" },
        { id: "very_high", label: "Very high" },
      ],
      semanticDescription:
        "Overall risk level before any controls are applied, derived from Likelihood × Impact. Planned display rename: 'Inherent Risk Rating'. Used to prioritize mitigation effort and compare risks across the portfolio.",
    },
    {
      id: "residual_risk_score",
      name: "Residual risk score",
      type: "singleSelect",
      isOotb: true,
      options: [
        { id: "very_low", label: "Very low" },
        { id: "low", label: "Low" },
        { id: "medium", label: "Medium" },
        { id: "high", label: "High" },
        { id: "very_high", label: "Very high" },
      ],
      semanticDescription:
        "Remaining risk level after controls and mitigations have been applied. Planned display rename: 'Residual Risk Rating'. Compared against the Inherent Risk Score to assess control effectiveness.",
    },

    // ── Mitigation ────────────────────────────────────────────────────────────
    {
      id: "treatment_type",
      name: "Treatment type",
      type: "singleSelect",
      isOotb: true,
      options: [
        { id: "accept", label: "Accept" },
        { id: "avoid", label: "Avoid" },
        { id: "mitigate", label: "Mitigate" },
        { id: "transfer", label: "Transfer" },
      ],
      semanticDescription:
        "The organization's chosen response strategy for this risk. 'Accept' means tolerating the risk as-is; 'Avoid' means eliminating the activity causing it; 'Mitigate' means taking action to reduce likelihood or impact; 'Transfer' means shifting the exposure to a third party (e.g. via insurance or contract).",
    },
    {
      id: "mitigation_plan",
      name: "Mitigation plan",
      type: "longText",
      isOotb: true,
      semanticDescription:
        "Description of the specific actions planned or underway to reduce the likelihood or impact of this risk. Should be detailed enough to assign ownership and track progress. Linked to the Treatment type selection.",
    },
    {
      id: "mitigation_target_date",
      name: "Target date",
      type: "date",
      isOotb: true,
      semanticDescription:
        "Date by which the mitigation actions should be completed. Used to flag overdue mitigations in portfolio dashboards and drive accountability for the Response owner.",
    },
    {
      id: "mitigation_status",
      name: "Mitigation status",
      type: "singleSelect",
      isOotb: true,
      options: [
        { id: "not_started", label: "Not started" },
        { id: "in_progress", label: "In progress" },
        { id: "completed", label: "Completed" },
        { id: "overdue", label: "Overdue" },
        { id: "cancelled", label: "Cancelled" },
      ],
      semanticDescription:
        "Current progress of the mitigation plan. Updated by the Response owner as actions are completed. 'Overdue' is set automatically when the Target date passes without the status reaching 'Completed'.",
    },
    {
      id: "response_owner",
      name: "Response owner",
      type: "user",
      isOotb: true,
      semanticDescription:
        "Individual responsible for executing and tracking the mitigation plan. May differ from the Risk owner, who holds overall accountability for the risk. Should have the authority and resources to carry out the planned actions.",
    },

    // ── Attachments ───────────────────────────────────────────────────────────
    {
      id: "risk_attachment",
      name: "Attachment",
      type: "attachment",
      attachmentMode: "multiple",
      isOotb: true,
      semanticDescription:
        "Documents that support or substantiate this risk record, such as audit findings, incident reports, regulatory notices, or risk assessments. Attach PDFs, spreadsheets, or images. Multiple files are supported.",
    },
  ],
};

/**
 * Pre-seeded custom attributes for the Risk schema management prototype.
 *
 * These represent planned Score section additions from the H2/2025 roadmap
 * (target Q4 2025 / Q1 2026) that a Schema Administrator has already configured
 * as custom attributes ahead of their planned promotion to OOTB fields.
 *
 * One attribute is deprecated to demonstrate the attribute lifecycle flow.
 */
export const initialCustomAttributes: AttributeDefinition[] = [
  {
    id: "custom-likelihood-residual",
    name: "Likelihood (residual)",
    type: "singleSelect",
    isOotb: false,
    lifecycleStatus: "active",
    sectionId: "score",
    options: [
      { id: "very_low", label: "Very low" },
      { id: "low", label: "Low" },
      { id: "medium", label: "Medium" },
      { id: "high", label: "High" },
      { id: "very_high", label: "Very high" },
    ],
    semanticDescription:
      "Probability that this risk will occur after existing controls and mitigations are applied. Used alongside Impact (residual) to derive the residual risk rating. Planned for promotion to a built-in Score field.",
  },
  {
    id: "custom-impact-residual",
    name: "Impact (residual)",
    type: "singleSelect",
    isOotb: false,
    lifecycleStatus: "active",
    sectionId: "score",
    options: [
      { id: "very_low", label: "Very low" },
      { id: "low", label: "Low" },
      { id: "medium", label: "Medium" },
      { id: "high", label: "High" },
      { id: "very_high", label: "Very high" },
    ],
    semanticDescription:
      "Severity of consequences after controls and mitigations are applied. Used alongside Likelihood (residual) to derive the residual risk rating. Planned for promotion to a built-in Score field.",
  },
  {
    id: "custom-assessment-due-date",
    name: "Assessment due date",
    type: "dateTime",
    isOotb: false,
    lifecycleStatus: "active",
    sectionId: "overview",
    semanticDescription:
      "Date by which the next formal risk assessment must be completed. Used to trigger review reminders and identify overdue assessments in portfolio dashboards.",
  },
  {
    id: "custom-risk-appetite",
    name: "Risk appetite",
    type: "singleSelect",
    isOotb: false,
    lifecycleStatus: "active",
    sectionId: "overview",
    options: [
      { id: "averse", label: "Averse" },
      { id: "minimal", label: "Minimal" },
      { id: "cautious", label: "Cautious" },
      { id: "open", label: "Open" },
      { id: "hungry", label: "Hungry" },
    ],
    semanticDescription:
      "The organization's stated level of risk appetite for this risk type, as defined in the risk appetite framework. Compared against the current risk score to flag out-of-appetite exposures.",
  },
  {
    id: "custom-risk-tier-legacy",
    name: "Risk tier (legacy)",
    type: "text",
    isOotb: false,
    lifecycleStatus: "deprecated",
    sectionId: "overview",
    deprecationReason:
      "Replaced by the structured 'Risk category' built-in attribute as part of the ERM schema standardization. Historical values are preserved on existing records for audit purposes.",
    deprecatedAt: "2025-11-15T09:00:00Z",
    semanticDescription:
      "Free-text tier label inherited from the legacy risk register. No longer used for new records.",
  },
];

/**
 * Pre-seeded audit log entries for the initial custom attributes.
 * Represents the creation events that would have been captured by the backend
 * when these attributes were first defined. All dated March 26, 2025.
 */
export const initialAuditLog: AuditLogEntry[] = initialCustomAttributes.map((attr) => ({
  id: `audit-seed-${attr.id}`,
  attributeId: attr.id,
  attributeName: attr.name,
  action: "created",
  actor: "Schema Administrator",
  timestamp: "2025-03-26T10:00:00.000Z",
}));
