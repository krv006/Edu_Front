
type Renderer = (latex: string, options?: { defaultMode?: "math" | "inline-math" }) => string;

let rendererPromise: Promise<Renderer> | null = null;
let editorPromise: Promise<void> | null = null;

export function loadLatexRenderer(): Promise<Renderer> {
  rendererPromise ??= Promise.all([
    import("mathlive/ssr"),
    import("mathlive/static.css"),
    import("mathlive/fonts.css"),
  ]).then(([module]) => module.convertLatexToMarkup as Renderer);
  return rendererPromise;
}

export function loadMathfieldElement(): Promise<void> {
  editorPromise ??= Promise.all([
    import("mathlive"),
    import("mathlive/static.css"),
    import("mathlive/fonts.css"),
  ]).then(() => undefined);
  return editorPromise;
}
