export function isRichHtmlContent(value?: string | null): boolean {
  if (!value) return false;
  return /<\s*(p|div|br|strong|b|em|i|a|figure|img|ul|ol|li|blockquote|h[1-6]|span)\b/i.test(value);
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function sanitizePostHtml(value?: string | null): string {
  if (!value) return "";

  return value
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/\son[a-z]+="[^"]*"/gi, "")
    .replace(/\son[a-z]+='[^']*'/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/<a\b(?![^>]*\btarget=)([^>]*)>/gi, '<a target="_blank" rel="noopener noreferrer"$1>');
}

export function normalizeEditorHtml(value?: string | null): string {
  if (!value) return "<p></p>";
  if (isRichHtmlContent(value)) return sanitizePostHtml(value);

  const paragraphs = value
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br>")}</p>`);

  return paragraphs.length ? paragraphs.join("") : "<p></p>";
}
