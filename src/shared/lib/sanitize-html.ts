import DOMPurify from "dompurify";

/**
 * Backend HTML'ini brauzerda ko'rsatishdan oldin tozalaydi.
 *
 * Backend allaqachon `nh3` bilan tozalaydi (docs/COMPLETED_WORK.md §2), lekin
 * bu matnni admin yozadi va hamma foydalanuvchiga ko'rsatiladi — server tomon
 * qoidasi o'zgarib ketsa ham mijoz himoyasiz qolmasligi kerak.
 *
 * Ruxsat berilgan teglar hujjatdagi ro'yxatga mos: faqat formatlash, rasm/skript yo'q.
 */
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
    // `javascript:` va boshqa xavfli sxemalar bloklanadi.
    ALLOWED_URI_REGEXP: /^(?:https?|mailto|tel):/i,
  });
}

/** HTML'dan qisqa oddiy matn — ro'yxatdagi ko'rinish uchun. */
export function htmlToPlainText(html: string, limit = 140): string {
  const element = document.createElement("div");
  element.innerHTML = sanitizeHtml(html);
  const text = (element.textContent ?? "").replace(/\s+/g, " ").trim();
  return text.length > limit ? `${text.slice(0, limit).trimEnd()}…` : text;
}
