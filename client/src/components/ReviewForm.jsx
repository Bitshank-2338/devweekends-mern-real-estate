import { useState } from 'react';
import { ErrorMessage } from './ErrorMessage';

// Used for writing a new review and for editing an existing one.
export function ReviewForm({ review, onSubmit, onCancel }) {
  const [rating, setRating] = useState(review?.rating || 5);
  const [comment, setComment] = useState(review?.comment || '');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await onSubmit({ rating, comment });
      if (!review) setComment('');
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="form review-form" onSubmit={handleSubmit}>
      <ErrorMessage message={error} />

      <fieldset className="rating-input">
        <legend>Rating</legend>
        {[1, 2, 3, 4, 5].map((value) => (
          <label key={value} className={value <= rating ? 'active' : ''}>
            <input
              type="radio"
              name="rating"
              value={value}
              checked={rating === value}
              onChange={() => setRating(value)}
            />
            <span aria-hidden="true">★</span>
            <span className="visually-hidden">{value} stars</span>
          </label>
        ))}
      </fieldset>

      <label>
        Comment
        <textarea
          rows="3"
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          required
          maxLength={1000}
          placeholder="What did you like? What should others know?"
        />
      </label>

      <div className="form-actions">
        <button type="submit" className="btn" disabled={submitting}>
          {submitting ? 'Saving...' : review ? 'Save review' : 'Post review'}
        </button>
        {onCancel && (
          <button type="button" className="btn btn-outline" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
