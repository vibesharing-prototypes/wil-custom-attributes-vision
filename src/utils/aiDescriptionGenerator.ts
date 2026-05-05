import type { AttributeType } from "../types/attribute.js";

/**
 * Simulated AI description generator for the prototype.
 *
 * In production, this would call an LLM endpoint with:
 *   - The semantic-descriptions-guidelines injected as system context
 *   - The object schema context for related attributes
 *   - The attribute name, type, and any draft description
 *
 * The generated descriptions follow the 3-part structure from the guidelines:
 *   1. What the field captures
 *   2. When/why it's used (business context)
 *   3. Example values or format constraints
 */

const TYPE_CONTEXT_NOUN: Record<AttributeType, string> = {
  text: "short text",
  longText: "long-form text description",
  number: "numeric value",
  date: "calendar date",
  dateTime: "date and time stamp",
  singleSelect: "single-choice classification",
  multiSelect: "multi-choice classification",
  user: "individual user",
  users: "group of users",
  boolean: "yes/no indicator",
  currency: "monetary amount",
  attachment: "file attachment",
  url: "URL",
  email: "email address",
  phone: "phone number",
};

type TemplateGenerator = (name: string) => string;

const TYPE_TEMPLATES: Record<AttributeType, TemplateGenerator> = {
  singleSelect: (name) =>
    `Classification that assigns a single category to "${name}" on this record. Used in portfolio-level reporting, ownership routing, and filter views. Select the value that most accurately reflects the current state.`,

  multiSelect: (name) =>
    `One or more classifications applied to "${name}" on this record. Used to tag records across multiple reporting dimensions and compliance frameworks. Select all values that apply.`,

  user: (name) =>
    `The individual accountable for "${name}" on this record. Must have the authority to act on behalf of the organization for this responsibility. Typically a senior staff member, team lead, or designated owner.`,

  users: (name) =>
    `A group of individuals involved in "${name}" for this record. Used for notification routing, review assignments, and audit trails. These are secondary contacts — distinct from the primary responsible party.`,

  boolean: (name) =>
    `Indicates whether "${name}" applies to this record. Set to "Yes" when the condition is confirmed; leave empty or set to "No" otherwise. Used in reporting filters and workflow condition rules.`,

  currency: (name) =>
    `Monetary value representing the ${name.toLowerCase()} for this record, expressed in the organization's reporting currency. Used for financial exposure reporting, prioritization, and trend analysis across the portfolio.`,

  date: (name) =>
    `Calendar date for "${name}". Captures the target or actual date without a time component. Used to track milestones, trigger deadline notifications, and filter records by time window. Format: YYYY-MM-DD.`,

  dateTime: (name) =>
    `Exact date and time for "${name}", captured to the minute. Used in audit logs, SLA compliance tracking, and time-series reporting. Stored in UTC; displayed in the user's local timezone.`,

  number: (name) =>
    `Numeric value representing the ${name.toLowerCase()} for this record. Used in threshold calculations, comparative reporting, and portfolio-level scoring. Enter a positive integer or decimal where applicable.`,

  text: (name) =>
    `Short text capturing "${name}" for this record. Should be concise and consistently formatted across records to support accurate filtering and reporting. Example: a code, label, or identifier relevant to this field.`,

  longText: (name) =>
    `Detailed description of "${name}" for this record. Provide enough context for a reviewer unfamiliar with this record to understand its current state without prior knowledge. Avoid internal acronyms and jargon.`,

  attachment: (name) =>
    `Supporting documents or files for "${name}". Attach PDFs, spreadsheets, images, or other evidence relevant to this record. Used during audits and reviews to substantiate the data entered on this record.`,

  url: (name) =>
    `Link to an external resource related to "${name}". Must begin with https://. Used to reference external documentation, regulatory notices, or third-party systems. Example: https://example.com/reference.`,

  email: (name) =>
    `Email address for "${name}". Used for automated notifications and escalation routing when this record changes state. Enter a valid organizational email address. Example: owner@company.com.`,

  phone: (name) =>
    `Contact phone number for "${name}". Used for out-of-band escalations when email communication is insufficient. Include country code for international numbers. Example: +1 555 000 0000.`,
};

/**
 * Generates a suggested semantic description for an attribute.
 * Simulates network latency to represent a real AI API call.
 *
 * @param name - The attribute name as entered by the user
 * @param type - The selected attribute type
 * @param existingDescription - Optional existing description (used for refinement mode)
 */
export async function generateSemanticDescription(
  name: string,
  type: AttributeType,
  existingDescription?: string,
): Promise<string> {
  // Simulate LLM response latency
  const delay = 1000 + Math.random() * 600;
  await new Promise<void>((resolve) => setTimeout(resolve, delay));

  const trimmedName = name.trim() || TYPE_CONTEXT_NOUN[type];
  const template = TYPE_TEMPLATES[type];

  if (!template) {
    return `${TYPE_CONTEXT_NOUN[type]} capturing "${trimmedName}" for this record.`;
  }

  const generated = template(trimmedName);

  // If there is existing content, refine rather than fully replace —
  // preserve the first sentence of the original and append the AI context.
  if (existingDescription?.trim()) {
    const firstSentence = existingDescription
      .trim()
      .split(/(?<=[.?!])\s+/)[0]
      .trim();
    if (firstSentence.length > 20 && firstSentence !== generated.split(".")[0].trim()) {
      const aiSuffix = generated.split(".").slice(1).join(".").trim();
      return aiSuffix ? `${firstSentence}. ${aiSuffix}` : generated;
    }
  }

  return generated;
}
