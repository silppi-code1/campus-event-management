// My Events Page: Shows events the logged-in student is registered for
// Students can view and cancel registrations

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function MyEvents({ token, user }) {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const limit = 6;

  // Redirect if not logged in as student
  useEffect(() => {
    if (!token || user?.role !== 'student') {
      navigate('/login');
      return;
    }

    fetchMyEvents();
  }, [token, user, page, navigate]);

  const fetchMyEvents = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `http://localhost:5000/api/registrations/my-events?page=${page}&limit=${limit}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch events');
      }

      setEvents(data.data);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (eventId, eventTitle) => {
    if (!window.confirm(`Cancel registration for "${eventTitle}"?`)) return;

    try {
      const response = await fetch(`http://localhost:5000/api/registrations/${eventId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Cancellation failed');
      }

      // Remove event from list
      setEvents(events.filter((e) => e._id !== eventId));
      // Refetch to update pagination
      fetchMyEvents();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <div className="page-heading">
        <h1>My Registered Events</h1>
        <p>View and manage your event registrations</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading your events...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="info-message">
          You haven't registered for any events yet.
          <Link to="/events" className="btn" style={{ marginTop: '1rem' }}>
            Browse Events
          </Link>
        </div>
      ) : (
        <>
          <div className="events-grid">
            {events.map((event) => (
              <div key={event._id} className="event-card">
                <div className="event-card-header">
                  <h3 className="event-card-title">{event.title}</h3>
                  <span className="event-card-category">{event.category}</span>
                </div>

                <div className="event-card-body">
                  <p style={{ marginBottom: '1rem', color: '#666' }}>
                    {event.description.substring(0, 80)}...
                  </p>

                  <div className="event-detail">
                    <strong>📅 Date:</strong>
                    {new Date(event.date).toLocaleDateString()}
                  </div>

                  <div className="event-detail">
                    <strong>⏰ Time:</strong>
                    {event.time}
                  </div>

                  <div className="event-detail">
                    <strong>📍 Location:</strong>
                    {event.location}
                  </div>

                  <div className="event-detail">
                    <strong>👥 Capacity:</strong>
                    {event.registrationCount}/{event.capacity}
                  </div>
                </div>

                <div className="event-card-footer">
                  <Link to={`/event/${event._id}`} className="btn" style={{ margin: 0 }}>
                    View Details
                  </Link>
                  <button
                    onClick={() => handleCancel(event._id, event.title)}
                    className="btn btn-danger"
                    style={{ margin: 0 }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className={page === 1 ? 'disabled' : ''}
              >
                ← Previous
              </button>

              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
                (pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={page === pageNum ? 'active' : ''}
                  >
                    {pageNum}
                  </button>
                )
              )}

              <button
                onClick={() => setPage(page + 1)}
                disabled={page === pagination.totalPages}
                className={page === pagination.totalPages ? 'disabled' : ''}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default MyEvents;
