import { useEffect, useRef, useState } from "react";
import { loadMathfieldElement } from "../lib/mathlive-loader";

export interface MathFieldInputProps {
  value: string;
  onChange: (latex: string) => void;
}

export function MathFieldInput({ value, onChange }: MathFieldInputProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    loadMathfieldElement().then(() => {
      if (active) setReady(true);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    if (!ready || !host) return;

    const field = document.createElement("math-field") as HTMLElement & { value: string };
    field.className = "math-field";
    field.value = value;
    const handleInput = () => onChange(field.value);
    field.addEventListener("input", handleInput);
    host.replaceChildren(field);
    field.focus();

    return () => {
      field.removeEventListener("input", handleInput);
      host.replaceChildren();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  if (!ready) {
    return (
      <div className="input-shell">
        <input
          autoFocus
          value={value}
          placeholder="\frac{a}{b}"
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
    );
  }

  return <div className="math-field-host" ref={hostRef} />;
}
