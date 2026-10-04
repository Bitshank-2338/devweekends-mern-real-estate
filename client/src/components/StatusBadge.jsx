// Colour-coded pill for inquiry and appointment statuses.
export function StatusBadge({ status }) {
  return <span className={`status-badge status-${status}`}>{status}</span>;
}
