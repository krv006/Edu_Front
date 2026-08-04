import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme, type ThemeMode } from "@/shared/model";
import { cn } from "@/shared/lib";

const MODES: Array<{ id: ThemeMode; label: string; icon: typeof Sun }> = [
  { id: "light", label: "Yorug‘", icon: Sun },
  { id: "dark", label: "Qorong‘i", icon: Moon },
  { id: "system", label: "Tizim", icon: Monitor },
];

/** Uchta holatli segment: yorug‘ / qorong‘i / tizim. */
export function ThemeToggle({ className }: { className?: string }) {
  const { mode, setMode } = useTheme();

  return (
    <div className={cn("theme-toggle", className)} role="radiogroup" aria-label="Mavzu">
      {MODES.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            type="button"
            role="radio"
            aria-checked={mode === item.id}
            aria-label={item.label}
            title={item.label}
            className={mode === item.id ? "is-active" : ""}
            onClick={() => setMode(item.id)}
          >
            <Icon size={15} />
          </button>
        );
      })}
    </div>
  );
}

/** Bitta tugmali variant — joy tor bo'lgan panellar uchun. */
export function ThemeToggleButton({ className }: { className?: string }) {
  const { resolved, toggle } = useTheme();
  return (
    <button
      type="button"
      className={cn("icon-button", className)}
      onClick={toggle}
      aria-label={resolved === "dark" ? "Yorug‘ rejimga o‘tish" : "Qorong‘i rejimga o‘tish"}
    >
      {resolved === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
