import { useEffect, useState } from "react";
import { loadLatexRenderer } from "../lib/mathlive-loader";

export interface MathMarkupProps {
  latex: string;
  size?: number;
  color?: string;
}

export function MathMarkup({ latex, size = 24, color = "currentColor" }: MathMarkupProps) {
  const [markup, setMarkup] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    loadLatexRenderer()
      .then((render) => {
        if (active) setMarkup(render(latex));
      })
      .catch(() => {
        if (active) setMarkup(null);
      });
    return () => {
      active = false;
    };
  }, [latex]);

  const style = { fontSize: `${size}px`, color };

  return markup ? (
    <span className="math-markup" style={style} dangerouslySetInnerHTML={{ __html: markup }} />
  ) : (
    <span className="math-markup math-markup--raw" style={style}>
      {latex}
    </span>
  );
}
