import DOMPurify from "dompurify";

const ALLOWED_TAGS = [
  "p", "br", "b", "strong", "i", "em", "u", "s",
  "ul", "ol", "li", "a", "blockquote", "code", "pre",
  "h1", "h2", "h3", "h4", "span", "hr",
];

const ALLOWED_ATTR = ["href", "title", "target", "rel"];

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html ?? "", {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOWED_URI_REGEXP: /^(?:https?|mailto|tel):/i,
  });
}

export function htmlToPlainText(html: string, limit = 140): string {
  const element = document.createElement("div");
  element.innerHTML = sanitizeHtml(html);
  const text = (element.textContent ?? "").replace(/\s+/g, " ").trim();
  return text.length > limit ? `${text.slice(0, limit).trimEnd()}…` : text;
}
