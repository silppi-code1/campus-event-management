// Event Details Page: Shows full event information
// Students can register/cancel registration, admins can edit/delete

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

function EventDetails({ token, user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [registering, setRegistering] = useState(false);

  // Fetch event details
  useEffect(() => {
    fetchEvent();
  }, [id]);

  // Check if student is registered
  useEffect(() => {
    if (token && user?.role === 'student') {
      checkRegistration();
    }
  }, [id, token, user]);

  const fetchEvent = async () => {
    try {
      const response = await fetch(`/api/events/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch event');
      }

      setEvent(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const checkRegistration = async () => {
    try {
      const response = await fetch(`/api/registrations/check/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setIsRegistered(data.data.isRegistered);
    } catch (err) {
      console.log('Registration check failed:', err);
    }
  };

  const handleRegister = async () => {
    setRegistering(true);
    setError('');

    try {
      const response = await fetch('/api/registrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ eventId: id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      setIsRegistered(true);
      setEvent({ ...event, registrationCount: event.registrationCount + 1 });
    } catch (err) {
      setError(err.message);
    } finally {
      setRegistering(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel your registration?')) return;

    setRegistering(true);
    setError('');

    try {
      const response = await fetch(`/api/registrations/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Cancellation failed');
      }

      setIsRegistered(false);
      setEvent({ ...event, registrationCount: event.registrationCount - 1 });
    } catch (err) {
      setError(err.message);
    } finally {
      setRegistering(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;

    try {
      const response = await fetch(`/api/events/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Deletion failed');
      }

      navigate('/events');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading event details...</p>
      </div>
    );
  }

  if (!event) {
    return <div className="error-message">Event not found</div>;
  }

  const isEventFull = event.registrationCount >= event.capacity;
  const isEventCreator = user?.role === 'admin' && event.createdBy?._id === user.id;

  return (
    <div>
      <Link to="/events" className="nav-link" style={{ marginBottom: '1rem', display: 'inline-block' }}>
        ← Back to Events
      </Link>

      <div
        style={{
          background: 'white',
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '2rem',
          }}
        >
          <h1 style={{ marginBottom: '1rem' }}>{event.title}</h1>
          <span
            className="event-card-category"
            style={{ background: 'rgba(255, 255, 255, 0.3)', marginRight: '1rem' }}
          >
            {event.category}
          </span>
          {event.createdBy && (
            <span style={{ fontSize: '0.9rem' }}>
              Created by: <strong>{event.createdBy.name}</strong>
            </span>
          )}
        </div>

        {/* Error message */}
        {error && <div className="error-message" style={{ margin: '1rem' }}>{error}</div>}

        {/* Content */}
        <div style={{ padding: '2rem' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h3>📝 Description</h3>
            <p style={{ fontSize: '1.05rem', lineHeight: '1.6', color: '#555' }}>
              {event.description}
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '2rem',
              marginBottom: '2rem',
            }}
          >
            <div>
              <h4>📅 Date</h4>
              <p style={{ fontSize: '1.2rem', color: '#667eea' }}>
                {new Date(event.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>

            <div>
              <h4>⏰ Time</h4>
              <p style={{ fontSize: '1.2rem', color: '#667eea' }}>{event.time}</p>
            </div>

            <div>
              <h4>📍 Location</h4>
              <p style={{ fontSize: '1.2rem', color: '#667eea' }}>{event.location}</p>
            </div>

            <div>
              <h4>👥 Capacity</h4>
              <p style={{ fontSize: '1.2rem', color: '#667eea' }}>
                {event.registrationCount}/{event.capacity} registered
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div style={{ marginBottom: '2rem' }}>
            <div
              style={{
                background: '#eee',
                borderRadius: '4px',
                overflow: 'hidden',
                height: '30px',
              }}
            >
              <div
                style={{
                  background: isEventFull ? '#ff6b6b' : '#667eea',
                  width: `${Math.min((event.registrationCount / event.capacity) * 100, 100)}%`,
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  transition: 'width 0.3s ease',
                }}
              >
                {Math.round((event.registrationCount / event.capacity) * 100)}%
              </div>
            </div>
          </div>

          {/* Status and Capacity Warning */}
          {isEventFull && (
            <div className="error-message">
              ⚠️ This event is at full capacity. No more registrations accepted.
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '2rem' }}>
            {token && user?.role === 'student' && (
              <>
                {isRegistered ? (
                  <button
                    onClick={handleCancel}
                    className="btn btn-danger"
                    disabled={registering}
                  >
                    {registering ? 'Cancelling...' : 'Cancel Registration'}
                  </button>
                ) : (
                  <button
                    onClick={handleRegister}
                    className="btn"
                    disabled={registering || isEventFull}
                  >
                    {registering ? 'Registering...' : 'Register for Event'}
                  </button>
                )}
              </>
            )}

            {isEventCreator && (
              <>
                <Link to={`/edit-event/${id}`} className="btn btn-secondary">
                  Edit Event
                </Link>
                <button onClick={handleDelete} className="btn btn-danger">
                  Delete Event
                </button>
              </>
            )}

            {!token && (
              <div className="info-message">
                <Link to="/login" className="btn">
                  Login to Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventDetails;
