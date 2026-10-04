export function StarRating({ rating }) {
  const rounded = Math.round(rating);

  return (
    <span className="stars" aria-label={`${rating} out of 5 stars`}>
      {'★'.repeat(rounded)}
      <span className="stars-empty">{'★'.repeat(5 - rounded)}</span>
    </span>
  );
}
