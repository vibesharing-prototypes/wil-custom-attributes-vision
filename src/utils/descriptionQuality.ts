/**
 * Heuristic quality scoring for attribute semantic descriptions.
 * Based on the 6-criterion checklist in src/docs/semantic-descriptions-guidelines.md.
 * Used by the inline description quality indicator in the attribute form.
 */

export type QualityLevel = "poor" | "fair" | "good";

export interface QualityCriterion {
  id: string;
  label: string;
  passed: boolean;
}

export interface DescriptionQuality {
  level: QualityLevel;
  /** Number of criteria passed (0–6) */
  score: number;
  criteria: QualityCriterion[];
}

const VAGUE_PHRASES = [
  "stores information about",
  "contains the value of",
  "contains information",
  "stores the value",
  "used to store",
  "this field",
  "this attribute",
];

/**
 * Assess the quality of a semantic description against the 6-point guidelines checklist.
 * Returns both a summary level and per-criterion details for display.
 */
export function assessDescriptionQuality(
  description: string,
  fieldName: string,
): DescriptionQuality {
  const trimmed = description.trim();
  const lower = trimmed.toLowerCase();
  const words = trimmed.split(/\s+/).filter(Boolean);

  const criteria: QualityCriterion[] = [
    {
      id: "explains_what",
      label: "Explains what the field captures",
      passed: words.length >= 10,
    },
    {
      id: "business_context",
      label: "Provides business context",
      passed: /\b(used for|used by|used to|helps|enables|allows|required for|needed for|indicates|tracks|provides|supports|identifies|determines|captures)\b/.test(
        lower,
      ),
    },
    {
      id: "examples_or_format",
      label: "Includes example values or format hints",
      passed:
        /\b(e\.g\.|example|such as|for example|values?:|format:|range:|like )\b/.test(lower) ||
        /\d+[–\-–]\d+/.test(trimmed) ||
        /\(e\.g\./.test(trimmed),
    },
    {
      id: "specificity",
      label: "Specific enough for an AI agent",
      passed: words.length >= 20,
    },
    {
      id: "no_vague_phrases",
      label: "Avoids vague filler phrases",
      passed: !VAGUE_PHRASES.some((phrase) => lower.includes(phrase)),
    },
    {
      id: "no_name_repetition",
      label: "Doesn't open with the field name",
      passed:
        fieldName.trim().length === 0 ||
        !lower.startsWith(
          fieldName
            .toLowerCase()
            .trim()
            .split(/\s+/)[0]
            .replace(/[^a-z0-9]/gi, ""),
        ),
    },
  ];

  const score = criteria.filter((c) => c.passed).length;
  const level: QualityLevel = score <= 2 ? "poor" : score <= 4 ? "fair" : "good";

  return { level, score, criteria };
}
