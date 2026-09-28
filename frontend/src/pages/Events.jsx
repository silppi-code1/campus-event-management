// Events Page: Displays all events with search, category filter, and pagination
// Uses backend pagination with page and limit parameters

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Events({ token, user }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const limit = 6; // Events per page

  // Fetch events when search, category, or page changes
  useEffect(() => {
    fetchEvents();
  }, [search, category, page]);

  const fetchEvents = async () => {
    setLoading(true);
    setError('');

    try {
      // Build query string with search, category, page, and limit
      let url = `/api/events?page=${page}&limit=${limit}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (category) url += `&category=${encodeURIComponent(category)}`;

      const response = await fetch(url);
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

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1); // Reset to first page
  };

  const handleCategoryFilter = (e) => {
    setCategory(e.target.value);
    setPage(1); // Reset to first page
  };

  return (
    <div>
      <div className="page-heading">
        <h1>All Events</h1>
        <p>Browse and register for upcoming campus events</p>
      </div>

      {/* Search and Filter Bar */}
      <div className="search-filter">
        <input
          type="text"
          placeholder="Search events by title or description..."
          value={search}
          onChange={handleSearch}
        />

        <select value={category} onChange={handleCategoryFilter}>
          <option value="">All Categories</option>
          <option value="Technology">Technology</option>
          <option value="Workshop">Workshop</option>
          <option value="Sports">Sports</option>
          <option value="Cultural">Cultural</option>
        </select>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading events...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="info-message">No events found. Try adjusting your search or filters.</div>
      ) : (
        <>
          <div className="events-grid">
            {events.map((event) => (
              <Link
                key={event._id}
                to={`/event/${event._id}`}
                style={{ textDecoration: 'none' }}
              >
                <div className="event-card">
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
                    <button className="btn" style={{ margin: 0 }}>
                      View Details
                    </button>
                  </div>
                </div>
              </Link>
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

              {/* Page Numbers */}
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

export default Events;
