export function ErrorMessage({ message, onRetry }) {
  if (!message) return null;

  return (
    <div className="error-message" role="alert">
      <span>{message}</span>
      {onRetry && (
        <button type="button" className="btn btn-small btn-outline" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
