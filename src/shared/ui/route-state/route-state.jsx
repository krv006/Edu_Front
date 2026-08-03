export function RouteState({ eyebrow, title, description, action, actionLabel, onAction }) {
  return (
    <main className="route-state" role="main">
      <span>{eyebrow}</span>
      <h1>{title}</h1>
      <p>{description}</p>
      {action ?? (actionLabel && <button className="button button--primary" onClick={onAction}>{actionLabel}</button>)}
    </main>
  );
}
