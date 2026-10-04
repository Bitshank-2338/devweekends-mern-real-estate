import { useState } from 'react';
import { Link } from 'react-router';
import { ReviewForm } from './ReviewForm';
import { StarRating } from './StarRating';
import { formatDate } from '../utils/format';

// Shows reviews. The current user's own reviews get Edit and Delete buttons.
// `showProperty` swaps the author name for the property title (dashboard view).
export function ReviewList({ reviews, currentUserId, onUpdate, onDelete, showProperty = false }) {
  const [editingId, setEditingId] = useState(null);

  if (reviews.length === 0) {
    return <p className="muted">No reviews yet.</p>;
  }

  async function handleUpdate(reviewId, values) {
    await onUpdate(reviewId, values);
    setEditingId(null);
  }

  return (
    <ul className="review-list">
      {reviews.map((review) => {
        const isOwn = review.author?._id === currentUserId;

        return (
          <li key={review._id} className="review">
            {editingId === review._id ? (
              <ReviewForm
                review={review}
                onSubmit={(values) => handleUpdate(review._id, values)}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <>
                <div className="review-header">
                  <strong>
                    {showProperty && review.property ? (
                      <Link to={`/properties/${review.property._id}`}>{review.property.title}</Link>
                    ) : (
                      review.author?.name
                    )}
                  </strong>
                  <StarRating rating={review.rating} />
                </div>
                <p>{review.comment}</p>
                <p className="muted small">{formatDate(review.createdAt)}</p>

                {isOwn && (
                  <div className="card-actions">
                    <button
                      type="button"
                      className="btn btn-small btn-outline"
                      onClick={() => setEditingId(review._id)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn-small btn-danger"
                      onClick={() => onDelete(review._id)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </>
            )}
          </li>
        );
      })}
    </ul>
  );
}
