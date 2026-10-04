import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router';
import { api } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { AgentCard } from '../components/AgentCard';
import { InquiryForm } from '../components/InquiryForm';
import { AppointmentForm } from '../components/AppointmentForm';
import { ReviewForm } from '../components/ReviewForm';
import { ReviewList } from '../components/ReviewList';
import { StarRating } from '../components/StarRating';
import { LoadingState } from '../components/LoadingState';
import { ErrorMessage } from '../components/ErrorMessage';
import { formatPrice, PLACEHOLDER_IMAGE, showPlaceholderImage } from '../utils/format';

// "Contact Agent" and "Schedule Visit" depend on who is looking at the page.
function ContactActions({ property }) {
  const { user } = useAuth();
  const location = useLocation();
  const [activePanel, setActivePanel] = useState(null);

  if (!user) {
    return (
      <div className="contact-actions">
        <p className="muted">Log in as a buyer to contact the agent or book a visit.</p>
        <Link to="/login" state={{ from: location.pathname }} className="btn btn-block">
          Log in to contact agent
        </Link>
      </div>
    );
  }

  if (property.owner?._id === user.id) {
    return (
      <div className="contact-actions">
        <p className="muted">This is your listing.</p>
        <Link to="/dashboard" className="btn btn-block">
          Manage in dashboard
        </Link>
      </div>
    );
  }

  if (user.role !== 'buyer') {
    return <p className="muted">Inquiries and visits are available to buyer accounts.</p>;
  }

  const togglePanel = (panel) => setActivePanel((current) => (current === panel ? null : panel));

  return (
    <div className="contact-actions">
      <div className="button-pair">
        <button
          type="button"
          className={`btn ${activePanel === 'inquiry' ? '' : 'btn-outline'}`}
          onClick={() => togglePanel('inquiry')}
        >
          Contact Agent
        </button>
        <button
          type="button"
          className={`btn ${activePanel === 'visit' ? '' : 'btn-outline'}`}
          onClick={() => togglePanel('visit')}
        >
          Schedule Visit
        </button>
      </div>
      {activePanel === 'inquiry' && <InquiryForm property={property} />}
      {activePanel === 'visit' && <AppointmentForm property={property} />}
    </div>
  );
}

export default function PropertyDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [property, setProperty] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewError, setReviewError] = useState('');

  const loadProperty = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [propertyData, reviewData] = await Promise.all([
        api.get(`/api/properties/${id}`),
        api.get(`/api/reviews?property=${id}`),
      ]);
      setProperty(propertyData.property);
      setReviews(reviewData.reviews);
      setActiveImage(0);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProperty();
  }, [loadProperty]);

  async function handleCreateReview(values) {
    const data = await api.post('/api/reviews', { property: id, ...values });
    setReviews((current) => [data.review, ...current]);
  }

  async function handleUpdateReview(reviewId, values) {
    const data = await api.put(`/api/reviews/${reviewId}`, values);
    setReviews((current) =>
      current.map((review) => (review._id === data.review._id ? data.review : review))
    );
  }

  async function handleDeleteReview(reviewId) {
    if (!window.confirm('Delete your review?')) return;
    setReviewError('');

    try {
      await api.delete(`/api/reviews/${reviewId}`);
      setReviews((current) => current.filter((review) => review._id !== reviewId));
    } catch (deleteError) {
      setReviewError(deleteError.message);
    }
  }

  if (loading) return <LoadingState text="Loading property..." />;
  if (error) {
    return (
      <div className="container page">
        <ErrorMessage message={error} onRetry={loadProperty} />
        <Link to="/properties">Back to properties</Link>
      </div>
    );
  }

  const images = property.images.length > 0 ? property.images : [PLACEHOLDER_IMAGE];
  const averageRating = reviews.length
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;
  const canReview = user?.role === 'buyer' && !reviews.some((r) => r.author?._id === user.id);

  return (
    <div className="container page">
      <Link to="/properties" className="back-link">
        ← All properties
      </Link>

      <div className="gallery">
        <img
          className="gallery-main"
          src={images[activeImage]}
          alt={property.title}
          onError={showPlaceholderImage}
        />
        {images.length > 1 && (
          <div className="gallery-thumbs">
            {images.map((image, index) => (
              <button
                key={image}
                type="button"
                className={index === activeImage ? 'active' : ''}
                onClick={() => setActiveImage(index)}
                aria-label={`Show photo ${index + 1}`}
              >
                <img src={image} alt="" loading="lazy" onError={showPlaceholderImage} />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="details-layout">
        <section>
          <div className="details-heading">
            <div>
              <span className={`badge badge-inline badge-${property.listingType}`}>
                {property.listingType === 'rent' ? 'For Rent' : 'For Sale'}
              </span>
              <h1>{property.title}</h1>
              <p className="muted">
                {property.address}, {property.city}
                {property.state !== property.city && `, ${property.state}`}
              </p>
            </div>
            <p className="details-price">{formatPrice(property.price, property.listingType)}</p>
          </div>

          <ul className="details-stats">
            <li>
              <strong>{property.propertyType}</strong>
              <span>Type</span>
            </li>
            <li>
              <strong>{property.bedrooms}</strong>
              <span>Bedrooms</span>
            </li>
            <li>
              <strong>{property.bathrooms}</strong>
              <span>Bathrooms</span>
            </li>
            <li>
              <strong>{property.area.toLocaleString('en-IN')}</strong>
              <span>Sq ft</span>
            </li>
          </ul>

          <h2>About this property</h2>
          <p className="description">{property.description}</p>

          {property.amenities.length > 0 && (
            <>
              <h2>Amenities</h2>
              <ul className="amenity-list">
                {property.amenities.map((amenity) => (
                  <li key={amenity}>{amenity}</li>
                ))}
              </ul>
            </>
          )}

          <div className="reviews-section">
            <h2>
              Reviews{' '}
              {reviews.length > 0 && (
                <span className="rating-summary">
                  <StarRating rating={averageRating} /> {averageRating.toFixed(1)} ({reviews.length})
                </span>
              )}
            </h2>
            {canReview && (
              <div className="card">
                <h3>Write a review</h3>
                <ReviewForm onSubmit={handleCreateReview} />
              </div>
            )}
            <ErrorMessage message={reviewError} />
            <ReviewList
              reviews={reviews}
              currentUserId={user?.id}
              onUpdate={handleUpdateReview}
              onDelete={handleDeleteReview}
            />
          </div>
        </section>

        <aside className="details-sidebar">
          <div className="card">
            <h2 className="sidebar-title">Listed by</h2>
            {property.agent ? (
              <AgentCard agent={property.agent} showContact />
            ) : (
              <p>{property.owner?.name}</p>
            )}
            <ContactActions property={property} />
          </div>
        </aside>
      </div>
    </div>
  );
}
