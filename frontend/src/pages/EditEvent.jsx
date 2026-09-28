// Edit Event Page: Allows admins to update existing events
// Pre-populates form with current event data

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function EditEvent({ token, user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    category: 'Technology',
    capacity: '',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Redirect if not admin
  if (!token || user?.role !== 'admin') {
    navigate('/login');
    return null;
  }

  // Fetch event data on mount
  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const response = await fetch(`/api/events/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch event');
      }

      const event = data.data;

      // Check if admin is the creator
      if (event.createdBy._id !== user.id) {
        throw new Error('You can only edit your own events');
      }

      // Format date for input field (YYYY-MM-DD)
      const eventDate = new Date(event.date);
      const formattedDate = eventDate.toISOString().split('T')[0];

      setFormData({
        title: event.title,
        description: event.description,
        date: formattedDate,
        time: event.time,
        location: event.location,
        category: event.category,
        capacity: event.capacity,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      // Validate inputs
      if (!formData.title.trim()) {
        throw new Error('Title is required');
      }
      if (!formData.description.trim()) {
        throw new Error('Description is required');
      }
      if (!formData.date) {
        throw new Error('Date is required');
      }
      if (!formData.time) {
        throw new Error('Time is required');
      }
      if (!formData.location.trim()) {
        throw new Error('Location is required');
      }
      if (!formData.capacity || formData.capacity < 1) {
        throw new Error('Capacity must be at least 1');
      }

      // API call to update event
      const response = await fetch(`/api/events/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update event');
      }

      // Redirect to event details
      navigate(`/event/${id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading event...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-heading">
        <h1>Edit Event</h1>
        <p>Update event details</p>
      </div>

      <div className="form-container">
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Event Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="e.g., Web Development Workshop"
            />
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              placeholder="Provide a detailed description of the event..."
            />
          </div>

          <div className="form-group">
            <label>Category *</label>
            <select name="category" value={formData.category} onChange={handleChange}>
              <option value="Technology">Technology</option>
              <option value="Workshop">Workshop</option>
              <option value="Sports">Sports</option>
              <option value="Cultural">Cultural</option>
            </select>
          </div>

          <div className="form-group">
            <label>Date *</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Time *</label>
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Location *</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              placeholder="e.g., Auditorium, Room 101"
            />
          </div>

          <div className="form-group">
            <label>Capacity (Max Registrations) *</label>
            <input
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              required
              min="1"
              placeholder="100"
            />
          </div>

          <button type="submit" className="btn" disabled={submitting}>
            {submitting ? 'Updating...' : 'Update Event'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditEvent;
