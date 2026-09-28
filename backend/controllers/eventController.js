// Event Controller: Handles event CRUD operations and filtering
// Admins create/update/delete; all users can view events with search, filter, and pagination

const Event = require('../models/Event');
const mongoose = require('mongoose');

// Get all events with search, filtering, and pagination
exports.getEvents = async (req, res) => {
  try {
    const { search, category, page = 1, limit = 6 } = req.query;

    // Build filter object
    let filter = {};

    // Search: Find events by title or description
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } }, // Case-insensitive search
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Filter by category
    if (category) {
      filter.category = category;
    }

    // Calculate skip value for pagination
    // Example: page=2, limit=6 -> skip=6 (skip first 6 records)
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch events with pagination
    const events = await Event.find(filter)
      .populate('createdBy', 'name email') // Include admin name and email
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 }); // Most recent first

    // Count total documents matching filter for pagination info
    const total = await Event.countDocuments(filter);

    // Calculate total pages
    const totalPages = Math.ceil(total / parseInt(limit));

    res.status(200).json({
      message: 'Events fetched successfully',
      data: events,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalEvents: total,
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch events' });
  }
};

// Get single event by ID
exports.getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid event ID format' });
    }

    const event = await Event.findById(id).populate('createdBy', 'name email');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.status(200).json({
      message: 'Event fetched successfully',
      data: event,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch event' });
  }
};

// Create new event (admin only)
exports.createEvent = async (req, res) => {
  try {
    const { title, description, date, time, location, category, capacity } = req.body;

    // Input validation
    if (!title || !description || !date || !time || !location || !category || !capacity) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate date is in future
    const eventDate = new Date(date);
    if (eventDate < new Date()) {
      return res.status(400).json({ message: 'Event date must be in the future' });
    }

    // Validate capacity is positive
    if (capacity < 1) {
      return res.status(400).json({ message: 'Capacity must be at least 1' });
    }

    // Create new event
    const newEvent = new Event({
      title,
      description,
      date: eventDate,
      time,
      location,
      category,
      capacity,
      createdBy: req.user.id, // Set admin who created the event
    });

    await newEvent.save();

    res.status(201).json({
      message: 'Event created successfully',
      data: newEvent,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create event' });
  }
};

// Update event (admin only)
exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, date, time, location, category, capacity } = req.body;

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid event ID format' });
    }

    // Find event
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if admin is the creator
    if (event.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only edit your own events' });
    }

    // Validate date if provided
    if (date) {
      const eventDate = new Date(date);
      if (eventDate < new Date()) {
        return res.status(400).json({ message: 'Event date must be in the future' });
      }
    }

    // Update only provided fields
    if (title) event.title = title;
    if (description) event.description = description;
    if (date) event.date = new Date(date);
    if (time) event.time = time;
    if (location) event.location = location;
    if (category) event.category = category;
    if (capacity) event.capacity = capacity;

    await event.save();

    res.status(200).json({
      message: 'Event updated successfully',
      data: event,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update event' });
  }
};

// Delete event (admin only)
exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid event ID format' });
    }

    // Find event
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if admin is the creator
    if (event.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only delete your own events' });
    }

    // Delete event and all related registrations
    await Event.findByIdAndDelete(id);
    const EventRegistration = require('../models/EventRegistration');
    await EventRegistration.deleteMany({ eventId: id });

    res.status(200).json({
      message: 'Event deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete event' });
  }
};
