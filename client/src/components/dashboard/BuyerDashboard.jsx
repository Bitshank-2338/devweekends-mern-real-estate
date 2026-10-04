import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { api } from '../../api/api';
import { ReviewList } from '../ReviewList';
import { LoadingState } from '../LoadingState';
import { ErrorMessage } from '../ErrorMessage';
import { StatTile } from './StatTile';
import { AppointmentPreviewList, InquiryPreviewList } from './ActivityLists';
import { getUpcomingAppointments } from '../../utils/appointments';

export function BuyerDashboard({ user }) {
  const [inquiries, setInquiries] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewError, setReviewError] = useState('');

  const loadActivity = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [inquiryData, appointmentData, reviewData] = await Promise.all([
        api.get('/api/inquiries'),
        api.get('/api/appointments'),
        api.get('/api/reviews/mine'),
      ]);
      setInquiries(inquiryData.inquiries);
      setAppointments(appointmentData.appointments);
      setReviews(reviewData.reviews);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadActivity();
  }, [loadActivity]);

  async function handleUpdateReview(reviewId, values) {
    const data = await api.put(`/api/reviews/${reviewId}`, values);
    setReviews((current) =>
      current.map((review) => (review._id === data.review._id ? data.review : review))
    );
  }

  async function handleDeleteReview(reviewId) {
    if (!window.confirm('Delete this review?')) return;
    setReviewError('');

    try {
      await api.delete(`/api/reviews/${reviewId}`);
      setReviews((current) => current.filter((review) => review._id !== reviewId));
    } catch (deleteError) {
      setReviewError(deleteError.message);
    }
  }

  if (loading) return <LoadingState text="Loading your activity..." />;
  if (error) return <ErrorMessage message={error} onRetry={loadActivity} />;

  const upcoming = getUpcomingAppointments(appointments);

  return (
    <>
      <div className="stat-grid">
        <StatTile label="Inquiries sent" value={inquiries.length} to="/inquiries" />
        <StatTile label="Upcoming visits" value={upcoming.length} to="/appointments" />
        <StatTile label="Reviews written" value={reviews.length} to="#reviews" />
      </div>

      <div className="dashboard-grid">
        <section className="card">
          <h2>Upcoming visits</h2>
          <AppointmentPreviewList appointments={upcoming} role="buyer" />
        </section>

        <section className="card">
          <h2>Recent inquiries</h2>
          <InquiryPreviewList inquiries={inquiries} role="buyer" />
        </section>

        <section className="card" id="reviews">
          <h2>My reviews</h2>
          <ErrorMessage message={reviewError} />
          <ReviewList
            reviews={reviews}
            currentUserId={user.id}
            onUpdate={handleUpdateReview}
            onDelete={handleDeleteReview}
            showProperty
          />
        </section>

        <section className="card">
          <h2>My profile</h2>
          <dl className="profile-list">
            <dt>Name</dt>
            <dd>{user.name}</dd>
            <dt>Email</dt>
            <dd>{user.email}</dd>
            <dt>Account type</dt>
            <dd className="capitalize">{user.role}</dd>
          </dl>
          <Link to="/properties" className="btn btn-outline">
            Find your next home
          </Link>
        </section>
      </div>
    </>
  );
}
