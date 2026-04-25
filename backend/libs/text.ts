const CSS_BLOB_PATTERN = /(?:^|\s)\.?css-[\w-]+\s*\{[^}]+\}/g;
const CSS_DECLARATION_PATTERN =
  /\b(?:inline-size|block-size|margin-inline-start|margin-inline-end|vertical-align|display|webkit|ms-flex|flex)\s*:[^;{}]+;?/gi;

export function sanitizeDisplayText(input: string): string {
  if (!input) return "";

  return input
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(CSS_BLOB_PATTERN, " ")
    .replace(CSS_DECLARATION_PATTERN, " ")
    .replace(/\{[^{}]{0,400}\}/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\s*\n\s*/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
