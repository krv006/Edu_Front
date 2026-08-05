/**
 * MathLive'ni faqat kerak bo'lganda yuklaydi.
 *
 * Kutubxona ~1 MB, lekin formula vositasi faqat `math_enabled` (matematika)
 * kurslarda ochiladi — shuning uchun uni asosiy bundle'ga qo'shmaymiz.
 * `ssr` kirish nuqtasi yengilroq: unda `<math-field>` custom elementi va
 * virtual klaviatura yo'q, faqat LaTeX → markup konvertori bor.
 */

type Renderer = (latex: string, options?: { defaultMode?: "math" | "inline-math" }) => string;

let rendererPromise: Promise<Renderer> | null = null;
let editorPromise: Promise<void> | null = null;

/** Statik ko'rsatish uchun (doskadagi saqlangan formulalar). */
export function loadLatexRenderer(): Promise<Renderer> {
  rendererPromise ??= Promise.all([
    import("mathlive/ssr"),
    import("mathlive/static.css"),
    import("mathlive/fonts.css"),
  ]).then(([module]) => module.convertLatexToMarkup as Renderer);
  return rendererPromise;
}

/** `<math-field>` tahrirlagichini ro'yxatdan o'tkazadi (formula kiritish dialogi uchun). */
export function loadMathfieldElement(): Promise<void> {
  editorPromise ??= Promise.all([
    import("mathlive"),
    import("mathlive/static.css"),
    import("mathlive/fonts.css"),
  ]).then(() => undefined);
  return editorPromise;
}
