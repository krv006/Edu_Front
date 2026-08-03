export function LoadingFallback({ label = "Sahifa yuklanmoqda" }) {
  return (
    <div className="app-loading" role="status" aria-label={label}>
      <span aria-hidden="true" />
    </div>
  );
}
