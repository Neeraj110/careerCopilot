export function parseJsonFromText<T>(text: string): T {
  const trimmed = text.trim();

  try {
    return JSON.parse(trimmed) as T;
  } catch {
    const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (fenced?.[1]) {
      return JSON.parse(fenced[1]) as T;
    }

    const jsonStart = Math.min(
      ...[trimmed.indexOf("{"), trimmed.indexOf("[")].filter((idx) => idx >= 0),
    );

    if (Number.isFinite(jsonStart) && jsonStart >= 0) {
      const candidate = trimmed.slice(jsonStart);
      const endObject = candidate.lastIndexOf("}");
      const endArray = candidate.lastIndexOf("]");
      const endIndex = Math.max(endObject, endArray);

      if (endIndex >= 0) {
        return JSON.parse(candidate.slice(0, endIndex + 1)) as T;
      }
    }

    throw new Error("Failed to parse JSON response from model output");
  }
}
