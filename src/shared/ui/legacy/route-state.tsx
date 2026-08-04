import type { ReactNode } from "react";

export interface RouteStateProps {
  eyebrow?: string;
  title?: string;
  description?: string;
  action?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

export function RouteState({ eyebrow, title, description, action, actionLabel, onAction }: RouteStateProps) {
  return (
    <main className="route-state" role="main">
      <span>{eyebrow}</span>
      <h1>{title}</h1>
      <p>{description}</p>
      {action ??
        (actionLabel && (
          <button className="button button--primary" onClick={onAction}>
            {actionLabel}
          </button>
        ))}
    </main>
  );
}
