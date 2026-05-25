export type MentorSuggestion = {
  type: "course" | "lesson" | "lab" | "dataset";
  title: string;
  href: string;
  reason: string;
  ctaLabel: string;
  meta?: string;
};

export type MentorAnalysisCard = {
  title: string;
  summary: string;
  strengths: string[];
  focusAreas: string[];
  nextSteps: string[];
};

export type MentorStructuredMessage = {
  kind: "ai-datalab-mentor-v1";
  text: string;
  suggestions?: MentorSuggestion[];
  analysis?: MentorAnalysisCard | null;
};

function isSuggestion(value: unknown): value is MentorSuggestion {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.type === "string" &&
    typeof candidate.title === "string" &&
    typeof candidate.href === "string" &&
    typeof candidate.reason === "string" &&
    typeof candidate.ctaLabel === "string"
  );
}

function isAnalysis(value: unknown): value is MentorAnalysisCard {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.title === "string" &&
    typeof candidate.summary === "string" &&
    Array.isArray(candidate.strengths) &&
    Array.isArray(candidate.focusAreas) &&
    Array.isArray(candidate.nextSteps)
  );
}

export function serializeMentorStructuredMessage(payload: MentorStructuredMessage) {
  return JSON.stringify(payload);
}

export function parseMentorStructuredMessage(content: string): MentorStructuredMessage | null {
  try {
    const parsed = JSON.parse(content) as Record<string, unknown>;

    if (parsed.kind !== "ai-datalab-mentor-v1" || typeof parsed.text !== "string") {
      return null;
    }

    return {
      kind: "ai-datalab-mentor-v1",
      text: parsed.text,
      suggestions: Array.isArray(parsed.suggestions)
        ? parsed.suggestions.filter(isSuggestion)
        : undefined,
      analysis: isAnalysis(parsed.analysis) ? parsed.analysis : null,
    };
  } catch {
    return null;
  }
}

export function getMentorPlainText(content: string) {
  const parsed = parseMentorStructuredMessage(content);
  return parsed?.text || content;
}
