// Admin Dashboard: Shows events created by the logged-in admin
// Admins can view, edit, and delete their events

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function AdminDashboard({ token, user }) {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Redirect if not logged in as admin
  useEffect(() => {
    if (!token || user?.role !== 'admin') {
      navigate('/login');
      return;
    }

    fetchAdminEvents();
  }, [token, user, navigate]);

  const fetchAdminEvents = async () => {
    setLoading(true);
    setError('');

    try {
      // Fetch all events (no pagination limit for dashboard overview)
      const response = await fetch('http://localhost:5000/api/events?limit=100', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch events');
      }

      // Filter to show only events created by this admin
      const adminEvents = data.data.filter((event) => event.createdBy._id === user.id);
      setEvents(adminEvents);
    } catch (err) {
      setError(err.message);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (eventId, eventTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${eventTitle}"?`)) return;

    try {
      const response = await fetch(`http://localhost:5000/api/events/${eventId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Deletion failed');
      }

      // Remove event from list
      setEvents(events.filter((e) => e._id !== eventId));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <div className="page-heading">
        <h1>Admin Dashboard</h1>
        <p>Manage your created events</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <Link to="/create-event" className="btn" style={{ marginBottom: '2rem' }}>
        + Create New Event
      </Link>

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading your events...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="info-message">
          You haven't created any events yet.
          <Link to="/create-event" className="btn" style={{ marginTop: '1rem' }}>
            Create Your First Event
          </Link>
        </div>
      ) : (
        <div
          style={{
            background: 'white',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
          }}
        >
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
            }}
          >
            <thead>
              <tr style={{ background: '#667eea', color: 'white' }}>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Title</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Category</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Date</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Registrations</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event, index) => (
                <tr
                  key={event._id}
                  style={{
                    borderBottom: '1px solid #eee',
                    background: index % 2 === 0 ? '#f9f9f9' : 'white',
                  }}
                >
                  <td style={{ padding: '1rem' }}>
                    <Link
                      to={`/event/${event._id}`}
                      style={{ color: '#667eea', textDecoration: 'none', fontWeight: 'bold' }}
                    >
                      {event.title}
                    </Link>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span
                      style={{
                        background: '#e3f2fd',
                        color: '#1565c0',
                        padding: '0.3rem 0.8rem',
                        borderRadius: '20px',
                        fontSize: '0.85rem',
                        fontWeight: 'bold',
                      }}
                    >
                      {event.category}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {new Date(event.date).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {event.registrationCount}/{event.capacity}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <Link to={`/edit-event/${event._id}`} className="btn btn-secondary">
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(event._id, event.title)}
                      className="btn btn-danger"
                      style={{ marginLeft: '0.5rem' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ padding: '1rem', textAlign: 'center', color: '#666' }}>
            Total Events: <strong>{events.length}</strong>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
