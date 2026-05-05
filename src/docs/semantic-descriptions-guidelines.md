# Semantic descriptions (M0)

Source: M0 PRD FR-7, Design Brief §4.5

## Purpose

- Help humans understand what a field captures, how to populate it, and when it matters.
- Provide structured semantic context for M2 AI agents (MCP server) that read and write object data.

The quality bar is **identical for OOTB and custom descriptions**. The M2 MCP server treats them as equivalent sources of semantic context — an agent calling `get_object_schema` cannot distinguish OOTB from custom descriptions and relies on both equally.

## How to write a good description

Write 1–3 sentences covering:

1. **What** this field captures
2. **When/why** it's used (business context)
3. **Example values** or constraints (if useful)

Keep language clear and concrete. Avoid internal jargon. Write for both a non-specialist human and an AI agent.

## Quality checklist

- [ ] Explains what the field captures in plain language
- [ ] Provides business context (why does this field matter?)
- [ ] Includes example values or range/format hints where helpful
- [ ] Is specific enough that an AI agent could correctly populate the field
- [ ] Avoids vague phrases like "stores information about" or "contains the value of"
- [ ] Does not repeat the field name verbatim as the first word

## Examples

**Risk category**
"Primary classification for portfolio-level reporting and ownership routing. Choose the category that best represents the nature of the risk. Example values: Strategic, Operational, Financial, Compliance."

**Risk owner**
"Accountable individual responsible for monitoring and responding to this risk. Must have authority to approve mitigation actions. Typically a senior manager or department head."

**Inherent risk score**
"Baseline risk level before controls are applied, calculated from likelihood × impact. Range: 1–25. Used to compare risks across the portfolio and prioritize mitigation effort."

**Last reviewed at**
"Timestamp of the most recent formal review of this risk record. Used to identify stale records that haven't been reviewed within the required review cycle (typically quarterly)."

## Bad examples (avoid)

❌ "The risk category field." (Repeats field name, no context)
❌ "Contains information about the category." (Vague, unhelpful to both humans and agents)
❌ "Used by risk managers." (Tells who uses it but not what it captures or why)
