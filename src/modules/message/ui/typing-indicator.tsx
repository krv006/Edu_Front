export function TypingIndicator({ name }: { name: string }) {
  return (
    <div className="typing-indicator" aria-label={`${name} yozmoqda`}>
      <span />
      <span />
      <span />
      <small>{name.split(" ")[0]} yozmoqda</small>
    </div>
  );
}
